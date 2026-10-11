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
const output = path.join(root, '.cache/goal09-ui');
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
      controls: [...document.querySelectorAll('textarea,select,button,summary')].filter(element => element.getClientRects().length && element.getBoundingClientRect().width > 1).map(element => ({
        element: element.tagName.toLowerCase(), height: element.getBoundingClientRect().height,
        font_px: parseFloat(getComputedStyle(element).fontSize),
      })),
    }));
    assert(geometry.scroll_width_css_px <= width, `${name}: page overflow`);
    assert(geometry.controls.every(control => control.height >= 48), `${name}: control height`);
    const screenshot = path.join(output, `${name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    layouts.push({ name, width, height, text_scale: textScale, ...geometry, screenshot: `.cache/goal09-ui/${name}.png` });
  }
  await capture('desktop-input', 1440, 1000);
  await capture('tablet-input', 768, 1024);
  await capture('mobile-360-input', 360, 800);
  await page.getByRole('button',{name:'Upload a screenshot',exact:true}).click();
  await capture('mobile-360-screenshot',360,800);
  await capture('text-200-screenshot',640,900,2);
  await page.getByLabel('Choose screenshot',{exact:true}).setInputFiles({name:'fictional-corrupt.png',mimeType:'image/png',buffer:Buffer.from([137,80,78,71,13,10,26,10])});
  await page.getByRole('alert').waitFor();
  await capture('mobile-360-ocr-error',360,800);
  await page.getByRole('button',{name:'Paste a message instead',exact:true}).click();
  await page.evaluate(()=>{document.documentElement.style.fontSize='100%';});
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  await page.getByLabel('Message text', { exact: true }).fill('Please send me your login code. Pay the invoice immediately. Keep this secret.');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message', exact: true }).click();
  const response = await responsePromise;
  const warning = await response.json();
  assert.equal(warning.status, 'suspicious');
  assert.equal(warning.analysis_complete, false);
  await page.locator('.evidence-item summary').first().click();
  await page.getByText('What have you already done?',{exact:true}).click();
  await page.getByLabel('I shared a verification code.',{exact:true}).check();
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await capture('desktop-result-help', 1440, 1000);
  await capture('mobile-360-result-help', 360, 800);
  await capture('reflow-320-result-help', 320, 800);
  await capture('text-200-result-help', 640, 900, 2);
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  await page.getByLabel('Message text', { exact: true }).fill('We can meet for a fictional lunch tomorrow.');
  await page.getByRole('button', { name: 'Check message', exact: true }).click();
  await page.locator('.result[data-status="review"]').waitFor();
  await capture('desktop-review', 1440, 1000);
  await page.getByLabel('Message text', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Check message', exact: true }).click();
  await capture('mobile-360-error', 360, 800);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const transition = await page.getByRole('button', { name: 'Check message', exact: true }).evaluate(element => getComputedStyle(element).transitionDuration);
  assert.equal(transition, '0s');
  await page.getByRole('link',{name:'Behind the AI',exact:true}).click();
  await page.getByText('View class results and confusion matrix',{exact:true}).click();
  await capture('desktop-transparency',1440,1000);
  await capture('mobile-360-transparency',360,800);
  await capture('text-200-transparency',640,900,2);
  // Real page zoom in an isolated full Chromium profile; no CSS zoom or root-font mutation.
  const profile=await mkdtemp(path.join(os.tmpdir(),'clearmessage-zoom-'));
  let zoomContext;
  const nativeZoom={passed:false,setting:'Chromium Page zoom 200%',profile:'temporary isolated test profile',layouts:[]};
  try{
    zoomContext=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:1440,height:1000}});
    const settings=await zoomContext.newPage();await settings.goto('chrome://settings/appearance');await settings.locator('#zoomLevel').waitFor();
    await settings.locator('#zoomLevel').selectOption('2');
    const zoomPage=await zoomContext.newPage();
    const capture=await zoomContext.newCDPSession(zoomPage);
    zoomPage.on('request',request=>requests.push(request.url()));zoomPage.on('pageerror',error=>errors.push(error.message));
    await zoomPage.goto(baseURL);await zoomPage.getByLabel('Message text',{exact:true}).waitFor();
    async function zoomCapture(name){
      const geometry=await zoomPage.evaluate(()=>({css_viewport_width:innerWidth,device_pixel_ratio:devicePixelRatio,root_font_px:parseFloat(getComputedStyle(document.documentElement).fontSize),body_font_px:parseFloat(getComputedStyle(document.body).fontSize),scroll_width:document.documentElement.scrollWidth}));
      assert.equal(geometry.css_viewport_width,720);assert.equal(geometry.device_pixel_ratio,2);assert.equal(geometry.root_font_px,16);assert.equal(geometry.body_font_px,20);assert(geometry.scroll_width<=geometry.css_viewport_width);
      // Full-page capture changes the viewport at native zoom and clips the resulting bitmap.
      // Preserve the actual zoomed viewport and verify its physical output width instead.
      const captured=await capture.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      const pixels=Buffer.from(captured.data,'base64');
      await writeFile(path.join(output,`${name}.png`),pixels);
      assert.equal(pixels.readUInt32BE(16),1440,'Native zoom screenshot was clipped');
      nativeZoom.layouts.push({name,...geometry,capture:'actual viewport',physical_screenshot_width:1440,screenshot:`.cache/goal09-ui/${name}.png`});
    }
    await zoomCapture('native-200-input');
    await zoomPage.getByLabel('Message text',{exact:true}).fill('Please send me your login code. Pay the invoice immediately. Keep this secret.');await zoomPage.getByLabel('Message language',{exact:true}).selectOption('en');
    await zoomPage.getByRole('button',{name:'Check message',exact:true}).click();await zoomPage.locator('.result[data-status="suspicious"]').waitFor();
    await zoomPage.locator('.evidence-item summary').first().click();await zoomPage.getByText('What have you already done?',{exact:true}).click();await zoomPage.getByLabel('I entered my password.',{exact:true}).check();await zoomPage.getByRole('button',{name:'Ask someone for help',exact:true}).click();
    await zoomCapture('native-200-result-guide-help');
    await zoomPage.getByRole('button',{name:'Upload a screenshot',exact:true}).click();await zoomCapture('native-200-screenshot');
    await zoomPage.getByLabel('Choose screenshot',{exact:true}).setInputFiles(path.join(root,'docs/data/goal09-demo-screenshot.png'));
    await zoomPage.getByLabel('Review the extracted text',{exact:true}).waitFor({timeout:60000});await zoomCapture('native-200-ocr-review');
    await zoomPage.getByRole('link',{name:'Behind the AI',exact:true}).click();await zoomPage.getByText('View class results and confusion matrix',{exact:true}).click();await zoomCapture('native-200-transparency');
    nativeZoom.passed=true;nativeZoom.browser=await zoomContext.browser().version();
  }finally{await zoomContext?.close();await rm(profile,{recursive:true,force:true});}
  assert.equal(errors.length, 0);
  assert(requests.every(url => new URL(url).origin === baseURL));
  const report = {
    goal: 'Goal 09', date: new Date().toISOString().slice(0, 10), executed_at_utc: new Date().toISOString(), node: process.version, browser: await browser.version(), device: `${os.platform()} ${os.arch()} desktop; emulated CSS viewports`,
    flow: 'English form → same-origin POST → real approved Goal 02 model/rules/policy 2 → incomplete result → neutral help preview',
    api: { http_status: response.status(), cache_control: response.headers()['cache-control'], model_version: warning.model_version, policy_version: warning.policy_version, analysis_complete: warning.analysis_complete, evidence_count: warning.evidence.length },
    contrasts, layouts, native_browser_zoom:nativeZoom, external_browser_requests: requests.filter(url => new URL(url).origin !== baseURL), page_errors: errors,
    reduced_motion_transition: transition,
    server_output_empty: serverOutput.length === 0,
    automated_checks_passed: true,
    zoom_scope: 'Separate 200% root text enlargement and genuine Chromium Page zoom at 200% in a fresh isolated profile; native desktop Chrome UI remains unavailable while the Mac is locked',
    manual_visual_inspection: 'This script does not perform manual inspection; see GOAL_09_TEST_REPORT.md for the separately recorded actual scope.',
    not_tested: ['desktop Chrome UI on the locked Mac', 'physical mobile keyboard', 'real screen reader', 'human participants', 'Safari/Firefox', 'Docker', 'deployment'],
  };
  await writeFile(path.join(root, 'docs/data/goal09-ui-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`UI verification passed: ${layouts.length} captures, ${contrasts.length} contrast pairs, real model ${warning.model_version}.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
