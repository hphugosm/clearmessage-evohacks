/** Real API layout/contrast evidence. Only fictional public development messages. */
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import os from 'node:os';
import { createServer } from 'node:net';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, '.cache/goal04-ui');
const baseURL = 'http://127.0.0.1:8788';
const tokens = JSON.parse(await readFile(path.join(root, 'docs/design-tokens.json'), 'utf8'));
// Fail if the fixed port is occupied; never reuse another process's server.
const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(8788, '127.0.0.1', resolve); });
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const server = spawn(path.join(root, '.venv/bin/python'), ['scripts/serve.py', '--port', '8788'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
server.stdout.on('data', value => { serverOutput += value.toString(); });
server.stderr.on('data', value => { serverOutput += value.toString(); });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(`Verification server failed: ${serverOutput}`);
    try { ready = (await fetch(`${baseURL}/api/health`)).ok; } catch { /* Startup not ready. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert(ready, 'Verification server did not start');
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const requests = [];
  const errors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(['brand-primary','brand-hover','surface-page','surface-card','text-primary','text-secondary','text-secondary-page','border-control','state-positive-text','state-positive-surface','state-warning-text','state-warning-surface','state-danger-text','state-danger-surface'].map(key => [key, style.getPropertyValue(`--cm-${key}`).trim()]));
  });
  assert.equal(palette['brand-primary'].toUpperCase(), tokens.colors.brand.primary.toUpperCase());
  assert.equal(palette['surface-page'].toUpperCase(), tokens.colors.surface.page.toUpperCase());
  const luminance = hex => {
    const expanded = hex.length === 4 ? '#' + [...hex.slice(1)].map(value => value + value).join('') : hex;
    const rgb = expanded.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  const pairs = [
    ['body', 'text-primary', 'surface-page', 4.5], ['card body', 'text-primary', 'surface-card', 4.5],
    ['secondary page', 'text-secondary-page', 'surface-page', 4.5], ['secondary card', 'text-secondary', 'surface-card', 4.5],
    ['primary/disabled busy', 'surface-card', 'brand-primary', 4.5], ['primary hover/active', 'surface-card', 'brand-hover', 4.5],
    ['help button', 'brand-primary', 'surface-card', 4.5], ['warning text/icon', 'state-warning-text', 'state-warning-surface', 4.5],
    ['review text/icon', 'state-warning-text', 'surface-card', 4.5], ['reserved green text/icon', 'state-positive-text', 'state-positive-surface', 4.5],
    ['error text', 'state-danger-text', 'state-danger-surface', 4.5], ['control border', 'border-control', 'surface-card', 3],
    ['focus/page', 'brand-primary', 'surface-page', 3], ['focus/warning', 'brand-primary', 'state-warning-surface', 3],
  ];
  const contrasts = pairs.map(([name, fg, bg, minimum]) => {
    const first = luminance(palette[fg]), second = luminance(palette[bg]);
    const ratio = (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
    assert(ratio >= minimum, `Contrast failed: ${name}`);
    return { name, foreground: palette[fg], background: palette[bg], ratio: Number(ratio.toFixed(3)), minimum, passed: true };
  });
  const layouts = [];
  async function capture(name, width, height, textScale = 1) {
    await page.setViewportSize({ width, height });
    await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, textScale);
    const geometry = await page.evaluate(() => ({
      viewport_width_css_px: innerWidth, scroll_width_css_px: document.documentElement.scrollWidth,
      body_font_px: parseFloat(getComputedStyle(document.body).fontSize),
      grid_columns: getComputedStyle(document.querySelector('.hero')).gridTemplateColumns,
      illustration_display: getComputedStyle(document.querySelector('.hero-art')).display,
      controls: [...document.querySelectorAll('textarea,select,button,summary')].map(element => ({
        element: element.tagName.toLowerCase(), height: element.getBoundingClientRect().height,
        font_px: parseFloat(getComputedStyle(element).fontSize),
      })),
    }));
    assert(geometry.scroll_width_css_px <= width, `${name}: page overflow`);
    assert(geometry.controls.every(control => control.height >= 48), `${name}: control height`);
    const screenshot = path.join(output, `${name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    layouts.push({ name, width, height, text_scale: textScale, ...geometry, screenshot: `.cache/goal04-ui/${name}.png` });
  }
  await capture('desktop-input', 1440, 1000);
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  await page.getByLabel('Message text', { exact: true }).fill('Please send me your login code. Pay the invoice immediately. Keep this secret.');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check Message' }).click();
  const response = await responsePromise;
  const warning = await response.json();
  assert.equal(warning.status, 'suspicious');
  assert.equal(warning.analysis_complete, false);
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await capture('desktop-result-help', 1440, 1000);
  await capture('mobile-360-result-help', 360, 800);
  await capture('reflow-320-result-help', 320, 800);
  await capture('text-200-result-help', 640, 900, 2);
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  await page.getByLabel('Message text', { exact: true }).fill('We can meet for a fictional lunch tomorrow.');
  await page.getByRole('button', { name: 'Check Message' }).click();
  await page.locator('.result[data-status="review"]').waitFor();
  await capture('desktop-review', 1440, 1000);
  await page.getByLabel('Message text', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Check Message' }).click();
  await capture('mobile-360-error', 360, 800);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const transition = await page.getByRole('button', { name: 'Check Message' }).evaluate(element => getComputedStyle(element).transitionDuration);
  assert.equal(transition, '0s');
  assert.equal(errors.length, 0);
  assert(requests.every(url => new URL(url).origin === baseURL));
  const report = {
    goal: 'Goal 04', date: new Date().toISOString().slice(0, 10), executed_at_utc: new Date().toISOString(), node: process.version, browser: await browser.version(), device: `${os.platform()} ${os.arch()} desktop; emulated CSS viewports`,
    flow: 'English form → same-origin POST → real Goal 02 model/rules/policy 2 → incomplete result → neutral help preview',
    api: { http_status: response.status(), cache_control: response.headers()['cache-control'], model_version: warning.model_version, policy_version: warning.policy_version, analysis_complete: warning.analysis_complete, evidence_count: warning.evidence.length },
    contrasts, layouts, external_browser_requests: requests.filter(url => new URL(url).origin !== baseURL), page_errors: errors,
    reduced_motion_transition: transition,
    server_output_empty: serverOutput.length === 0,
    automated_checks_passed: true,
    zoom_scope: '640 CSS px viewport plus 200% root text enlargement; native browser zoom is recorded separately in goal04-native-zoom.json',
    manual_visual_inspection: 'This script does not perform manual inspection; see UI_VERIFICATION.md for the separately recorded actual scope.',
    not_tested: ['physical mobile keyboard', 'real screen reader', 'human participants', 'Safari/Firefox', 'Docker', 'deployment'],
  };
  await writeFile(path.join(root, 'docs/data/goal04-ui-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`UI verification passed: ${layouts.length} captures, ${contrasts.length} contrast pairs, real model ${warning.model_version}.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
