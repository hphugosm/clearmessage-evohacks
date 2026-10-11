/** Real release-server flow checker. No fixture/model overrides or screenshots. */
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const port = Number(process.argv[2]);
const mode = process.argv[3];
assert(Number.isInteger(port) && port > 0 && port < 65536);
assert(['real-model', 'failed-model'].includes(mode));
const origin = `http://127.0.0.1:${port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const requests = [], logs = [], errors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => logs.push(message.text()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.title(), 'ClearMessage — Message guidance');
  assert(await page.evaluate(() => document.fonts.check('20px Inter')));
  const checks = [];
  for (const [name, text, language, expected] of [
    ['ordinary', 'We can meet for a fictional lunch tomorrow.', 'en', 'review'],
    ['observed-warning', 'Please send me your login code. Pay the invoice immediately. Keep this secret.', 'en', 'suspicious'],
    ['unsupported-scope', 'We can meet for a fictional lunch tomorrow.', 'other', 'review'],
  ]) {
    await page.getByLabel('Message text', {exact:true}).fill(text);
    await page.getByLabel('Message language', {exact:true}).selectOption(language);
    const waiting = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
    await page.getByRole('button', {name:'Check Message',exact:true}).click();
    const response = await waiting;
    const result = await response.json();
    assert.equal(response.headers()['cache-control'], 'no-store');
    assert.equal(result.status, expected);
    assert.equal(result.analysis_complete, false);
    await page.locator(`.result[data-status="${expected}"]`).waitFor();
    assert(await page.getByText('Limited check · analysis is incomplete', {exact:true}).isVisible());
    if (mode === 'failed-model' && expected === 'review') assert(await page.getByText('Analysis not performed', {exact:true}).isVisible());
    if (mode === 'real-model') assert.equal(result.model_version, 'clearmessage-sparse-v1:b6e56c3f1d34');
    else assert.equal(result.model_version, null);
    await page.getByRole('button', {name:'Ask someone for help',exact:true}).click();
    const preview = await page.getByLabel('Help request preview').inputValue();
    assert(!preview.includes(text));
    assert.equal(await page.getByRole('button', {name:'Copy help request',exact:true}).count(), 1);
    checks.push({case:name, status:result.status, analysis_complete:result.analysis_complete});
  }
  assert(requests.every(url => new URL(url).origin === origin));
  assert.equal(errors.length, 0);
  assert(!logs.join(' ').includes('PRIVATE_RELEASE_CANARY'));
  assert.deepEqual(await page.evaluate(() => [localStorage.length,sessionStorage.length]), [0,0]);
  console.log(JSON.stringify({passed:true, browser:await browser.version(), flows:checks, external_requests:0, page_errors:0, local_assets_loaded:true}));
} catch {
  console.log(JSON.stringify({passed:false, code:'release_browser_flow_failed'}));
  process.exitCode = 1;
} finally {
  await browser?.close();
}
