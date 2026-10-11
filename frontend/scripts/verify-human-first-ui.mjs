/** Real API layout/contrast evidence. Only fictional public development messages. */
import { chromium } from '@playwright/test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import os from 'node:os';
import { createServer } from 'node:net';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, '.cache/goal10-ui');
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
    return Object.fromEntries(['brand-primary','brand-hover','surface-page','surface-card','surface-accent','text-primary','text-secondary','text-secondary-page','border-control','state-positive-text','state-positive-surface','state-warning-text','state-warning-surface','state-danger-text','state-danger-surface'].map(key => [key, style.getPropertyValue(`--cm-${key}`).trim()]));
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
    ['bubble body', 'text-primary', 'surface-accent', 4.5], ['highlight body', 'text-primary', 'state-warning-surface', 4.5],
    ['secondary page', 'text-secondary-page', 'surface-page', 4.5], ['secondary card', 'text-secondary', 'surface-card', 4.5],
    ['primary', 'surface-card', 'brand-primary', 4.5], ['primary hover/active', 'surface-card', 'brand-hover', 4.5],
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
  const disabledBackground = '#' + [0,2,4].map(index => Math.round(parseInt(palette['brand-primary'].slice(1+index,3+index),16)*.75+255*.25).toString(16).padStart(2,'0')).join('');
  const disabledRatio=(luminance('#FFFFFF')+.05)/(luminance(disabledBackground)+.05);
  assert(disabledRatio>=4.5,'Disabled primary contrast');
  contrasts.push({name:'disabled primary at 0.75 opacity over white',foreground:'#FFFFFF',background:disabledBackground,ratio:Number(disabledRatio.toFixed(3)),minimum:4.5,passed:true});
  const layouts = [];
  async function capture(name, width, height, textScale = 1) {
    await page.setViewportSize({ width, height });
    await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, textScale);
    const geometry = await page.evaluate(() => ({
      viewport_width_css_px: innerWidth, scroll_width_css_px: document.documentElement.scrollWidth,
      body_font_px: parseFloat(getComputedStyle(document.body).fontSize),
      content_width_css_px: document.querySelector('.hero').getBoundingClientRect().width,
      controls: [...document.querySelectorAll('textarea,select,button,summary,label.check-row')].filter(element => element.getClientRects().length && element.getBoundingClientRect().width > 1).map(element => ({
        element: element.tagName.toLowerCase(), class_name: element.className, height: element.getBoundingClientRect().height,
        font_px: parseFloat(getComputedStyle(element).fontSize),
      })),
    }));
    assert(geometry.scroll_width_css_px <= width, `${name}: page overflow`);
    assert(geometry.controls.every(control => control.height >= 48), `${name}: control height`);
    assert(geometry.controls.every(control => control.font_px >= 16), `${name}: functional text below 16px`);
    const screenshot = path.join(output, `${name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    layouts.push({ name, width, height, text_scale: textScale, ...geometry, screenshot: `.cache/goal10-ui/${name}.png` });
  }
  await capture('desktop-home', 1440, 1000);
  await capture('mobile-360-home', 360, 800);
  await capture('reflow-320-home', 320, 800);
  await capture('text-200-home', 640, 900, 2);
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  await page.getByRole('button', {name: 'Paste a message', exact: true}).click();
  await capture('desktop-input', 1440, 1000);
  await capture('mobile-360-input', 360, 800);
  await page.getByRole('button', {name: 'Upload a screenshot', exact: true}).click();
  await capture('mobile-360-screenshot', 360, 800);
  await capture('text-200-screenshot', 640, 900, 2);
  await page.getByLabel('Choose screenshot', {exact: true}).setInputFiles({name: 'fictional-corrupt.png', mimeType: 'image/png', buffer: Buffer.from([137,80,78,71,13,10,26,10])});
  await page.getByRole('alert').waitFor();
  await capture('mobile-360-ocr-error', 360, 800);
  await page.getByRole('button', {name: 'Paste a message instead', exact: true}).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  const fictional = 'Your delivery is waiting. Pay the invoice immediately to release your parcel. Contact ava@example.invalid or +1 (202) 555-0123. Password: PRIVATE_CANARY. Sender: FRIEND_CANARY. Visit https://example.invalid/delivery.';
  await page.getByLabel('Message language', {exact: true}).selectOption('en');
  await page.getByLabel('Message text', {exact: true}).fill(fictional);
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', {name: 'Check message', exact: true}).click();
  const response = await responsePromise;
  const warning = await response.json();
  assert.equal(warning.model_version, 'clearmessage-sparse-v1:b6e56c3f1d34');
  assert.equal(warning.status, 'suspicious');
  assert.equal(warning.analysis_complete, false);
  await page.locator('.result').waitFor();
  assert.equal(await page.locator('#result-details').count(), 0, 'Details must be optional by default');
  assert.equal(await page.locator('#message').count(), 0, 'Original editor must be absent from result');
  await capture('desktop-simple-result', 1440, 1000);
  await capture('mobile-360-simple-result', 360, 800);
  await capture('reflow-320-simple-result', 320, 800);
  await page.getByRole('button', {name: 'Why this result?', exact: true}).click();
  await page.locator('.message-highlight').first().click();
  assert.equal(await page.locator('.message-highlight').first().getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.message-bubble a').count(), 0, 'Source URLs must remain inert');
  await capture('desktop-bubble', 1440, 1000);
  await capture('mobile-360-bubble', 360, 800);
  await page.getByRole('button', {name: 'Hide personal details', exact: true}).click();
  async function assertNoRenderedSecrets(secrets) {
    const rendered = await page.evaluate(() => document.body.outerHTML + '\n' + [...document.querySelectorAll('textarea,input')].map(field => field.value).join('\n'));
    for (const secret of secrets) assert(!rendered.includes(secret), 'Masked source leaked into rendered content');
  }
  await assertNoRenderedSecrets(['ava@example.invalid', '+1 (202) 555-0123', 'PRIVATE_CANARY', 'https://example.invalid/delivery']);
  await capture('desktop-shield', 1440, 1000);
  await capture('mobile-360-shield', 360, 800);
  await page.getByText('Privacy controls', {exact: true}).click();
  await page.getByRole('button', {name: 'Choose more text to hide', exact: true}).click();
  const maskField = page.getByLabel('Select text to hide', {exact: true});
  await maskField.focus();
  // Native textarea selection, followed by an actual user-facing masking action.
  await maskField.evaluate((field, secret) => {
    const start = field.value.indexOf(secret);
    if (start < 0) throw new Error('Fictional manual fixture unavailable');
    field.setSelectionRange(start, start + secret.length);
  }, 'FRIEND_CANARY');
  await page.getByRole('button', {name: 'Hide selected text', exact: true}).click();
  await assertNoRenderedSecrets(['ava@example.invalid', 'PRIVATE_CANARY', 'FRIEND_CANARY', 'https://example.invalid/delivery']);
  await page.locator('.evidence-item summary').first().click();
  await page.getByRole('button', {name: 'Ask someone for help', exact: true}).click();
  const draft = await page.getByLabel('Help request preview', {exact: true}).inputValue();
  assert(!/CANARY|example\.invalid|555-0123|invoice/i.test(draft), 'Neutral draft leaked source content');
  await capture('desktop-manual-mask-help', 1440, 1000);
  await capture('mobile-360-manual-mask-help', 360, 800);
  await capture('reflow-320-manual-mask-help', 320, 800);
  await capture('text-200-manual-mask-help', 640, 900, 2);
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  await page.getByRole('button', {name: 'Edit message', exact: true}).click();
  await page.getByLabel('Message text', {exact: true}).fill('We can meet for a fictional lunch tomorrow.');
  await page.getByRole('button', {name: 'Check message', exact: true}).click();
  await page.locator('.result[data-status="review"]').waitFor();
  await capture('desktop-review', 1440, 1000);
  await page.getByRole('button', {name: 'Edit message', exact: true}).click();
  await page.getByLabel('Message text', {exact: true}).fill('');
  await page.getByRole('button', {name: 'Check message', exact: true}).click();
  await capture('mobile-360-input-error', 360, 800);
  await page.emulateMedia({reducedMotion: 'reduce'});
  const transition = await page.getByRole('button', {name: 'Check message', exact: true}).evaluate(element => getComputedStyle(element).transitionDuration);
  assert.equal(transition, '0s');
  await page.getByRole('button', {name: 'Start again'}).click();
  await page.emulateMedia({forcedColors: 'active', reducedMotion: 'reduce'});
  await capture('mobile-360-forced-colors-home', 360, 800);
  const demoPromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', {name: 'Try an example', exact: true}).click();
  const demoResult = await (await demoPromise).json();
  assert.equal(demoResult.model_version, 'clearmessage-sparse-v1:b6e56c3f1d34');
  assert.equal(demoResult.analysis_complete, false);
  await page.getByRole('button', {name: 'Why this result?', exact: true}).click();
  await capture('mobile-360-forced-colors-bubble', 360, 800);
  await page.emulateMedia({forcedColors: 'none', reducedMotion: 'reduce'});
  await page.getByRole('link', {name: 'How it works', exact: true}).click();
  await page.getByText('View class results and confusion matrix', {exact: true}).click();
  await capture('desktop-transparency', 1440, 1000);
  await capture('mobile-360-transparency', 360, 800);
  await capture('text-200-transparency', 640, 900, 2);

  // Genuine Chromium Page zoom, isolated from the user's browser and settings.
  const profile = await mkdtemp(path.join(os.tmpdir(), 'clearmessage-goal10-zoom-'));
  let zoomContext;
  const nativeZoom = {passed: false, setting: 'Chromium Page zoom 200%', profile: 'temporary isolated test profile', layouts: []};
  try {
    zoomContext = await chromium.launchPersistentContext(profile, {channel: 'chromium', headless: true, viewport: {width: 1440, height: 1000}});
    const settings = await zoomContext.newPage();
    await settings.goto('chrome://settings/appearance');
    await settings.locator('#zoomLevel').waitFor();
    await settings.locator('#zoomLevel').selectOption('2');
    const zoomPage = await zoomContext.newPage();
    const captureSession = await zoomContext.newCDPSession(zoomPage);
    zoomPage.on('request', request => requests.push(request.url()));
    zoomPage.on('pageerror', error => errors.push(error.message));
    await zoomPage.goto(baseURL);
    await zoomPage.getByRole('button', {name: 'Try an example', exact: true}).waitFor();
    async function zoomCapture(name, focusSelector) {
      if (focusSelector) await zoomPage.locator(focusSelector).scrollIntoViewIfNeeded();
      const geometry = await zoomPage.evaluate(() => ({css_viewport_width: innerWidth, device_pixel_ratio: devicePixelRatio,
        root_font_px: parseFloat(getComputedStyle(document.documentElement).fontSize), body_font_px: parseFloat(getComputedStyle(document.body).fontSize),
        scroll_width: document.documentElement.scrollWidth}));
      assert.equal(geometry.css_viewport_width, 720);
      assert.equal(geometry.device_pixel_ratio, 2);
      assert.equal(geometry.root_font_px, 16);
      assert.equal(geometry.body_font_px, 20);
      assert(geometry.scroll_width <= geometry.css_viewport_width, 'Native zoom page overflow');
      const captured = await captureSession.send('Page.captureScreenshot', {format: 'png', fromSurface: true, captureBeyondViewport: false});
      const pixels = Buffer.from(captured.data, 'base64');
      await writeFile(path.join(output, `${name}.png`), pixels);
      assert.equal(pixels.readUInt32BE(16), 1440, 'Native zoom screenshot was clipped');
      nativeZoom.layouts.push({name, ...geometry, capture: 'actual viewport', physical_screenshot_width: 1440, screenshot: `.cache/goal10-ui/${name}.png`});
    }
    await zoomCapture('native-200-home');
    await zoomPage.getByRole('button', {name: 'Upload a screenshot', exact: true}).click();
    await zoomCapture('native-200-screenshot');
    await zoomPage.getByLabel('Choose screenshot', {exact: true}).setInputFiles(path.join(root, 'docs/data/goal09-demo-screenshot.png'));
    await zoomPage.getByLabel('Review the extracted text', {exact: true}).waitFor({timeout: 60000});
    await zoomCapture('native-200-ocr-review', '#message');
    await zoomPage.getByRole('button', {name: 'Start again'}).click();
    await zoomPage.getByRole('button', {name: 'Try an example', exact: true}).click();
    await zoomPage.locator('.result').waitFor();
    await zoomCapture('native-200-simple-result', '#result-heading');
    await zoomPage.getByRole('button', {name: 'Why this result?', exact: true}).click();
    await zoomPage.locator('.message-highlight').first().click();
    await zoomCapture('native-200-bubble', '.message-bubble');
    await zoomPage.getByRole('button', {name: 'Hide personal details', exact: true}).click();
    await zoomCapture('native-200-shield', '.message-bubble');
    await zoomPage.getByRole('link', {name: 'How it works', exact: true}).click();
    await zoomPage.getByText('View class results and confusion matrix', {exact: true}).click();
    await zoomCapture('native-200-transparency', '.metrics');
    nativeZoom.passed = true;
    nativeZoom.browser = await zoomContext.browser().version();
  } finally {
    await zoomContext?.close();
    await rm(profile, {recursive: true, force: true});
  }
  assert.equal(errors.length, 0, 'Browser page errors');
  assert(requests.every(url => new URL(url).origin === baseURL), 'External browser request');
  assert.equal(serverOutput, '', 'Application log output');
  const report = {
    goal: 'Goal 10', date: new Date().toISOString().slice(0,10), executed_at_utc: new Date().toISOString(), node: process.version,
    browser: await browser.version(), device: `${os.platform()} ${os.arch()} desktop; emulated CSS viewports`,
    flow: 'Home → same-origin real classifier/rules/policy → simple incomplete result → exact evidence bubble → display-only automatic/manual mask → neutral help preview',
    api: {http_status: response.status(), cache_control: response.headers()['cache-control'], model_version: warning.model_version,
      policy_version: warning.policy_version, analysis_complete: warning.analysis_complete, evidence_count: warning.evidence.length},
    contrasts, layouts, native_browser_zoom: nativeZoom,
    one_tap_demo: {real_api: true, model_version: demoResult.model_version, analysis_complete: demoResult.analysis_complete},
    privacy_checks: {rendered_canaries_absent_after_automatic_and_manual_masking: true, original_editor_absent_from_result: true, help_draft_neutral: true,
      manual_selection_scope: 'Native textarea selection API in browser automation, followed by clicking the actual Hide selected text control.'},
    external_browser_requests: requests.filter(url => new URL(url).origin !== baseURL), page_errors: errors,
    reduced_motion_transition: transition, forced_colors: {emulated: true, captures: ['mobile-360-forced-colors-home','mobile-360-forced-colors-bubble']},
    server_output_empty: true, automated_checks_passed: true,
    zoom_scope: 'Separate 200% root text enlargement and genuine Chromium Page zoom at 200% in a fresh isolated profile.',
    manual_visual_inspection: 'This script captures pixels and measures geometry; it does not perform manual visual inspection.',
    not_tested: ['physical mobile device', 'real screen-reader speech', 'human participants', 'actual Safari desktop application', 'Docker execution', 'public deployment', 'physical audio output'],
  };
  await writeFile(path.join(root, 'docs/data/goal10-ui-verification.json'), `${JSON.stringify(report,null,2)}\n`);
  console.log(`Goal 10 UI verification passed: ${layouts.length} captures plus ${nativeZoom.layouts.length} genuine zoom captures; ${contrasts.length} contrast pairs; real model ${warning.model_version}.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
