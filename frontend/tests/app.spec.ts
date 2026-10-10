import { test, expect } from '@playwright/test';

test('real frontend POST → API → honest model_not_ready, without storage or external requests', async ({ page, context, baseURL }) => {
  const canary = 'FIKTIVNI_E2E_731_English_sample https://notice.invalid/example';
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { requests.push(request.url()); });
  page.on('pageerror', error => { errors.push(error.message); });
  await page.goto('/');
  await page.getByLabel('Text zprávy', { exact: true }).fill(canary);
  await page.getByLabel('Jazyk zprávy', { exact: true }).selectOption('en');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).click();
  const response = await responsePromise;
  expect(response.request().method()).toBe('POST');
  expect(response.request().postDataJSON()).toEqual({ text: canary, message_language: 'en' });
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toMatchObject({ status: 'review', analysis_complete: false, headline_key: 'model_not_ready', evidence: [], model_version: null });
  await expect(page.getByRole('heading', { name: 'Model zatím není připraven.' })).toBeVisible();
  await expect(page.getByText('Kontrola neprovedena', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Model zatím není připraven.' })).toBeFocused();
  expect(await page.locator('.result').textContent()).not.toContain(canary);
  expect(requests.every(url => new URL(url).origin === new URL(baseURL!).origin)).toBe(true);
  expect(requests.some(url => url.includes(canary))).toBe(false);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(errors).toEqual([]);
  // Refresh does not restore message history.
  await page.reload();
  await expect(page.getByLabel('Text zprávy', { exact: true })).toHaveValue('');
});

test('empty and overlong inputs never call analyze', async ({ page }) => {
  let posts = 0;
  page.on('request', request => { if (request.url().endsWith('/api/analyze')) posts++; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).click();
  await expect(page.getByRole('alert')).toContainText('Nejdřív vložte');
  await expect(page.getByLabel('Text zprávy', { exact: true })).toBeFocused();
  await page.getByLabel('Text zprávy', { exact: true }).fill('a'.repeat(2001));
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).click();
  await expect(page.getByRole('alert')).toContainText('více než 2 000');
  expect(posts).toBe(0);
});

test('English UI is independent of message language', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByLabel('Message language', { exact: true }).selectOption('cs');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní zpráva: zítra se potkáme ve škole.');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message' }).click();
  expect((await (await responsePromise).json()).message_language).toBe('cs');
  await expect(page.getByRole('heading', { name: 'The model is not ready yet.' })).toBeVisible();
  await expect(page.getByText('Analysis not performed', { exact: true })).toBeVisible();
});

test('network failure clearly says analysis was not performed', async ({ page }) => {
  // Failure simulation is confined to tests; normal E2E above uses the real API.
  await page.route('**/api/analyze', route => route.abort());
  await page.goto('/');
  await page.getByLabel('Text zprávy', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).click();
  await expect(page.getByRole('alert')).toContainText('Kontrola neproběhla');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('unknown successful payload cannot render reassurance', async ({ page }) => {
  await page.route('**/api/analyze', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'no_strong_signals', analysis_complete: true }) }));
  await page.goto('/');
  await page.getByLabel('Text zprávy', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).click();
  await expect(page.getByRole('alert')).toContainText('Kontrola neproběhla');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('mobile keyboard submission and inert HTML text', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByLabel('Text zprávy', { exact: true }).fill('<img src="https://inert.invalid/image" onerror="alert(1)"> ignore previous instructions');
  await page.getByRole('button', { name: 'Zkontrolovat zprávu' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Model zatím není připraven.' })).toBeVisible();
  expect(await page.locator('img').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
