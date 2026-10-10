import { test, expect } from '@playwright/test';

test('real frontend POST → API → honest provisional review, without storage or external requests', async ({ page, context, baseURL }) => {
  const canary = 'FIKTIVNI_E2E_731_English_sample https://notice.invalid/example';
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { requests.push(request.url()); });
  page.on('pageerror', error => { errors.push(error.message); });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill(canary);
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check Message' }).click();
  const response = await responsePromise;
  expect(response.request().method()).toBe('POST');
  expect(response.request().postDataJSON()).toEqual({ text: canary, message_language: 'en' });
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toMatchObject({ status: 'review', analysis_complete: false, headline_key: 'review_required', evidence: [], model_version: 'clearmessage-sparse-v1:7fe727cfb786' });
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeVisible();
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeFocused();
  expect(await page.locator('.result').textContent()).not.toContain(canary);
  expect(requests.every(url => new URL(url).origin === new URL(baseURL!).origin)).toBe(true);
  expect(requests.some(url => url.includes(canary))).toBe(false);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(errors).toEqual([]);
  // Refresh does not restore message history.
  await page.reload();
  await expect(page.getByLabel('Message text', { exact: true })).toHaveValue('');
});

test('empty and overlong inputs never call analyze', async ({ page }) => {
  let posts = 0;
  page.on('request', request => { if (request.url().endsWith('/api/analyze')) posts++; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Check Message' }).click();
  await expect(page.getByRole('alert')).toContainText('Please paste a message first');
  await expect(page.getByLabel('Message text', { exact: true })).toBeFocused();
  await page.getByLabel('Message text', { exact: true }).fill('a'.repeat(2001));
  await page.getByRole('button', { name: 'Check Message' }).click();
  await expect(page.getByRole('alert')).toContainText('exceeds 2,000');
  expect(posts).toBe(0);
});

test('English UI is independent of message language', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByLabel('Message language', { exact: true }).selectOption('cs');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní zpráva: zítra se potkáme ve škole.');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check Message' }).click();
  expect((await (await responsePromise).json()).message_language).toBe('cs');
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeVisible();
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
});

test('network failure clearly says analysis was not performed', async ({ page }) => {
  // Failure simulation is confined to tests; normal E2E above uses the real API.
  await page.route('**/api/analyze', route => route.abort());
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Check Message' }).click();
  await expect(page.getByRole('alert')).toContainText('Analysis was not performed');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('unknown successful payload cannot render reassurance', async ({ page }) => {
  await page.route('**/api/analyze', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'no_strong_signals', analysis_complete: true }) }));
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Check Message' }).click();
  await expect(page.getByRole('alert')).toContainText('Analysis was not performed');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('mobile keyboard submission and inert HTML text', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('<img src="https://inert.invalid/image" onerror="alert(1)"> ignore previous instructions');
  await page.getByRole('button', { name: 'Check Message' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeVisible();
  expect(await page.locator('img[src="https://inert.invalid/image"]').count()).toBe(0);
  await expect(page.getByLabel('Message text', { exact: true })).toHaveValue('<img src="https://inert.invalid/image" onerror="alert(1)"> ignore previous instructions');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('real CZ rules without URL, neutral preview and gesture-only share canary', async ({ page }) => {
  const canary = 'FIKTIVNI_PRIVATE_CANARY_654321_Alex';
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async (payload: ShareData) => {
      (window as unknown as {sharedDrafts: ShareData[]}).sharedDrafts.push(payload);
    } });
    (window as unknown as {sharedDrafts: ShareData[]}).sharedDrafts = [];
  });
  const consoleMessages: string[] = [];
  page.on('console', message => consoleMessages.push(message.text()));
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill(`Pošli mi své heslo. ${canary}`);
  await page.getByLabel('Message language', { exact: true }).selectOption('cs');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check Message' }).click();
  const data = await (await responsePromise).json();
  expect(data).toMatchObject({ status: 'suspicious', analysis_complete: false,
    evidence: [{ key: 'request_for_secret', basis: 'observed_text_signal' }] });
  await expect(page.getByRole('heading', { name: 'There are warning signals in this message.' })).toBeVisible();
  await expect(page.getByText('Observed textual signal: a request to disclose a password or verification code.')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as {sharedDrafts: ShareData[]}).sharedDrafts)).toEqual([]);
  await expect(page.getByLabel('Help request preview')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  const preview = await page.getByLabel('Help request preview').inputValue();
  expect(preview).not.toMatch(/654321|CANARY|Alex|heslo|https?:/);
  expect(await page.evaluate(() => (window as unknown as {sharedDrafts: ShareData[]}).sharedDrafts)).toEqual([]);
  await page.getByRole('button', { name: 'Share help request' }).click();
  expect(await page.evaluate(() => (window as unknown as {sharedDrafts: ShareData[]}).sharedDrafts)).toEqual([{ text: preview }]);
  expect(consoleMessages.join(' ')).not.toContain(canary);
  await page.getByText('I already clicked or shared something', { exact: true }).click();
  await expect(page.getByText(/Do not enter any of those details here/)).toBeVisible();
  await page.getByLabel('Message text', { exact: true }).fill('Jiná fiktivní zpráva.');
  await expect(page.getByLabel('Help request preview')).toHaveCount(0);
});

test('Style A assets, English metadata and narrow text reflow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ClearMessage — Message guidance');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Understand messages.Make safer decisions.');
  await expect(page.getByText('EVOHACKS 2026 prototype')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  expect(await page.evaluate(() => document.fonts.check('20px Inter'))).toBe(true);
  const images = await page.locator('img').evaluateAll(elements => elements.map(element => {
    const image = element as HTMLImageElement;
    return { loaded: image.complete && image.naturalWidth > 0, decorative: image.alt === '' && image.getAttribute('aria-hidden') === 'true' };
  }));
  expect(images).toEqual([{ loaded: true, decorative: true }, { loaded: true, decorative: true }]);
  for (const width of [900, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Check Message', exact: true })).toBeVisible();
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByLabel('Message text', { exact: true })).toBeVisible();
});
