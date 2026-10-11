import { copy } from '../src/copy.ts';
import { writeFileSync } from 'node:fs';
const rows = [];
function collect(value, prefix = '') {
  for (const [key, child] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') rows.push(`| ${name} | ${child.replaceAll('|', '\\|').replaceAll('\n', '<br>')} |`);
    else collect(child, name);
  }
}
collect(copy);
writeFileSync(new URL('../../docs/UI_COPY.md', import.meta.url),
  `# ClearMessage English UI copy\n\nVersion 5.0 · 11 October 2026. Generated from the shared English dictionary; ${rows.length} string entries. The continuation shortens the main flow, keeps one visible limitations paragraph, and shows verified rule highlights immediately. Recorded-demo wording is explicit. Model facts remain unchanged.\n\n| Key | Exact current copy |\n|---|---|\n${rows.join('\n')}\n`);
