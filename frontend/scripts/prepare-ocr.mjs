import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public/assets/ocr');
const sources = {
  'worker.min.js': 'tesseract.js/dist/worker.min.js',
  'eng.traineddata.gz': '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz',
  'TESSERACT-LICENSE.txt': 'tesseract.js/LICENSE.md',
  'CORE-LICENSE.txt': 'tesseract.js-core/LICENSE',
};
for (const name of ['tesseract-core', 'tesseract-core-simd', 'tesseract-core-lstm', 'tesseract-core-simd-lstm']) {
  sources[`${name}.wasm.js`] = `tesseract.js-core/${name}.wasm.js`;
  sources[`${name}.wasm`] = `tesseract.js-core/${name}.wasm`;
}
await mkdir(output, { recursive: true });
const files = {};
for (const [name, source] of Object.entries(sources)) {
  const input = path.join(root, 'node_modules', source);
  const bytes = await readFile(input);
  files[name] = { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, source };
  await copyFile(input, path.join(output, name));
}
const manifest = { version: 1, tesseract: '6.0.1', core: '6.0.0', englishData: '1.0.0', files };
const serialized = JSON.stringify(manifest, null, 2) + '\n';
const recorded = path.join(root, 'ocr-assets.json');
if (process.argv.includes('--record')) await writeFile(recorded, serialized);
else if (await readFile(recorded, 'utf8') !== serialized) throw new Error('OCR asset identity differs from recorded setup');
await writeFile(path.join(output, 'manifest.json'), serialized);
console.log('Prepared hash-verified same-origin English OCR assets.');
