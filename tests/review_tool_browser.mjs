// Fictional browser review actions are confined to a temporary test directory.
import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const original = path.join(root, 'ml/data/mendeley-v1-audit-v2/review.completed.json');
const checksum = bytes => createHash('sha256').update(bytes).digest('hex');
const before = checksum(await readFile(original));
const directory = await mkdtemp(path.join(tmpdir(), 'clearmessage-review-browser-'));
const reviewPath = path.join(directory, 'review.json');
const rows = Array.from({length: 6}, (_, i) => ({row_id: `fictional-${i + 1}`, label: ['ham', 'spam', 'smishing'][Math.floor(i / 2)],
  text: i === 0 ? 'Fictional school notice. <img src="https://image.invalid/private" onerror="window.untrustedRan=true"> <script>window.untrustedRan=true</script> https://link.invalid/' : `Fictional message ${i + 1}: an internal browser test only.`}));
const review = {pipeline_version: 'data-prep-v2', source_input_sha256: '1'.repeat(64), exclusions_approved_by: '',
  records: rows.map(row => ({row_id: row.row_id, source_label: row.label, decision: 'pending', language: 'pending', reviewer_id: '', reviewed_date: '', notes: ''}))};
await writeFile(reviewPath, JSON.stringify(review));
await writeFile(path.join(directory, 'records.jsonl'), rows.map(row => JSON.stringify(row)).join('\n') + '\n');
const origin = 'http://127.0.0.1:8766';
const server = spawn(path.join(root, '.venv/bin/python'), ['scripts/review_tool.py', '--review', reviewPath, '--port', '8766', '--no-suggestions'], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
server.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
let browser;
try {
  for (let attempts = 0; attempts < 100; attempts++) {
    try { if ((await fetch(`${origin}/api/review`)).ok) break; } catch {}
    if (server.exitCode !== null) throw new Error('Temporary review server exited');
    if (attempts === 99) throw new Error('Temporary review server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    if (!route.request().url().startsWith(origin + '/')) { external.push(route.request().url()); return route.abort(); }
    if (route.request().url() === `${origin}/api/review`) {
      // Explicit test-only suggestion for highlight/filter verification.
      const response = await route.fetch(); const value = await response.json();
      value.records[2].suggested_label = 'ham';
      return route.fulfill({response, json: value});
    }
    return route.continue();
  });
  await page.goto(origin);
  await page.locator('tr[data-row-id]').first().waitFor();
  assert.equal(await page.locator('tr[data-row-id]').count(), 6);
  assert.equal(await page.locator('input[aria-label^="Reviewed"]:checked').count(), 0);
  assert.equal(await page.getByRole('button', {name: 'Approve all remaining reviewed entries as labeled', exact: true}).isDisabled(), true);
  await page.locator('tr[data-row-id="fictional-1"] summary').first().click();
  assert.equal(await page.locator('td a, td img, td script').count(), 0);
  assert.equal(await page.evaluate(() => window.untrustedRan), undefined);
  assert.equal(await page.locator('input[aria-label^="Reviewed"]:checked').count(), 0);
  assert.equal(await page.locator('tr.disagreement').count(), 1);
  await page.locator('#scope').selectOption('disagreements');
  assert.equal(await page.locator('tr[data-row-id]').count(), 1);
  await page.locator('#scope').selectOption('initial-pending');
  await page.locator('#label').selectOption('spam');
  assert.equal(await page.locator('tr[data-row-id]').count(), 2);
  assert.equal(await page.locator('tr[data-row-id]').first().getAttribute('data-row-id'), 'fictional-3');
  await page.locator('#label').selectOption('all');
  await page.getByRole('checkbox', {name: 'Reviewed fictional-1', exact: true}).check();
  await page.locator('#bulk').click();
  assert.equal(await page.locator('#confirm').isVisible(), true);
  assert.match(await page.locator('#confirm-description').textContent(), /1 entries: fictional-1/);
  await page.locator('#cancel-confirm').click();
  assert.equal(await page.locator('#save').isDisabled(), true);
  await page.locator('#bulk').click();
  await page.locator('#accept-confirm').click();
  assert.match(await page.locator('#selection').textContent(), /1 unsaved changes/);
  assert.equal(JSON.parse(await readFile(reviewPath)).records[0].decision, 'pending');
  await page.locator('#reviewer').fill('fictional-browser-tester');
  await page.locator('#save').click();
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved.'));
  assert.equal(JSON.parse(await readFile(reviewPath)).records[0].decision, 'confirmed');
  assert.equal(JSON.parse(await readFile(reviewPath)).records[1].decision, 'pending');
  await page.getByRole('checkbox', {name: 'Select fictional-2', exact: true}).check();
  await page.getByRole('checkbox', {name: 'Select fictional-3', exact: true}).check();
  await page.locator('#batch').selectOption('spam');
  await page.locator('#apply').click();
  assert.equal(await page.locator('#confirm').isVisible(), true);
  await page.locator('#accept-confirm').click();
  assert.match(await page.locator('#selection').textContent(), /2 unsaved changes/);
  await page.locator('#save').click();
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved.'));
  await page.getByRole('button', {name: 'Propose exclusion: fictional-4', exact: true}).click();
  await page.locator('#reason').fill('Fictional test duplicate proposal');
  await page.locator('#accept-confirm').click();
  assert.equal(await page.locator('#exclusions').isDisabled(), true);
  await page.locator('#save').click();
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved.'));
  await page.getByRole('checkbox', {name: 'Select fictional-2', exact: true}).uncheck();
  await page.getByRole('checkbox', {name: 'Select fictional-3', exact: true}).uncheck();
  await page.getByRole('checkbox', {name: 'Select fictional-4', exact: true}).check();
  await page.locator('#exclusions').click();
  assert.match(await page.locator('#confirm-title').textContent(), /Approve exclusion/);
  await page.locator('#cancel-confirm').click();
  assert.equal(await page.locator('#save').isDisabled(), true);
  await page.locator('#exclusions').click();
  await page.locator('#accept-confirm').click();
  await page.locator('#save').click();
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved.'));
  const saved = JSON.parse(await readFile(reviewPath));
  assert.equal(saved.records.length, 6);
  assert.equal(saved.exclusions_approved_by, '');
  assert.match(saved.records[3].notes, /exclusion_approved_by/);
  assert.equal(saved.records[4].decision, 'pending');
  await page.getByRole('button', {name: 'Unsure: fictional-5', exact: true}).click();
  await page.locator('#save').click();
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Saved.'));
  const report = await (await fetch(`${origin}/api/report`)).json();
  assert.equal(report.counters.pending, 2);
  assert.equal(report.any_entries_pending, true);
  assert.equal(report.changes_since_server_start.length, 5);
  await page.setViewportSize({width: 390, height: 844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({width: 1440, height: 1000});
  await page.screenshot({path: '/tmp/clearmessage-review-tool-fictional.png', fullPage: false});
  await page.reload();
  await page.locator('tr[data-row-id]').first().waitFor();
  assert.equal(await page.locator('input[aria-label^="Reviewed"]:checked').count(), 0);
  assert.equal(await page.locator('tr[data-row-id]').count(), 2);
  assert.equal(await page.locator('#bulk').isDisabled(), true);
  await page.setViewportSize({width: 390, height: 844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(external, []); assert.deepEqual(errors, []);
  assert.equal(checksum(await readFile(original)), before);
  assert.ok((await readdir(directory)).filter(name => name.includes('.backup-')).length >= 5);
  assert.equal(serverOutput.includes('Fictional school notice'), false);
  console.log('PASS: table/filter/sort, inert HTML/URLs, manual reviewed flags, bulk cancel/confirm, multi-select, separate exclusions, atomic saves/backups, report, reload, narrow layout, no browser egress; original review unchanged.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
  await new Promise(resolve => server.exitCode !== null ? resolve() : server.once('exit', resolve));
  await rm(directory, {recursive: true, force: true});
}
