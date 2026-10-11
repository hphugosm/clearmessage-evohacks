import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const frontend = path.join(root, 'frontend');
const base = process.env.VITE_BASE_PATH || '/clearmessage-evohacks/';
if (!/^\/[a-zA-Z0-9_/-]*\/$/.test(base) || base.includes('//') || base.includes('..')) throw new Error('invalid_pages_base');
const built = spawnSync('npm', ['run', 'build'], { cwd: frontend, stdio: 'inherit',
  env: { ...process.env, VITE_STATIC_DEMO: 'true', VITE_ENABLE_OCR: 'false', VITE_API_BASE_URL: '', VITE_BASE_PATH: base } });
if (built.status !== 0) process.exit(built.status || 1);
const destination = path.join(root, 'build/pages');
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(path.join(frontend, 'dist'), destination, { recursive: true,
  filter: source => !source.includes(`${path.sep}assets${path.sep}ocr`) });
mkdirSync(path.join(destination, 'licenses'), { recursive: true });
for (const [source, name] of [
  ['node_modules/react/LICENSE', 'React.txt'], ['node_modules/react-dom/LICENSE', 'React-DOM.txt'],
  ['src/assets/Inter-LICENSE.txt', 'Inter.txt'],
]) cpSync(path.join(frontend, source), path.join(destination, 'licenses', name));
writeFileSync(path.join(destination, '.nojekyll'), '');
if (existsSync(path.join(root, 'site/index.html'))) {
  mkdirSync(path.join(destination, 'project'), { recursive: true });
  cpSync(path.join(root, 'site/index.html'), path.join(destination, 'project/index.html'));
}
console.log(`Recorded demo prepared at build/pages with base ${base}. No live backend or OCR is included.`);
