import { test, expect } from '@playwright/test';

test('recorded mode makes no analysis requests, exposes real spans and keeps source out of sharing', async ({ page, context }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/clearmessage-evohacks/');
  await expect(page.getByText('Recorded demo · no live analysis', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Paste a message', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Upload a screenshot', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'This message looks suspicious.', exact: true })).toBeVisible();
  await expect(page.locator('.critical-limits')).toContainText('cannot confirm safety');
  const phrase = page.locator('.message-highlight');
  await expect(phrase).toHaveText('Pay the invoice immediately');
  await phrase.focus(); await page.keyboard.press('Enter');
  await expect(phrase).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'Pressure to pay quickly', exact: true })).toContainText('Observed textual signal');
  await expect(page.locator('.message-bubble a')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hide personal details', exact: true }).click();
  expect(await page.content()).not.toContain('https://example.invalid/delivery');
  await page.getByRole('button', { name: 'Ask someone for help', exact: true }).click();
  const preview = await page.getByLabel('Help request preview').inputValue();
  expect(preview).not.toMatch(/invoice|parcel|example\.invalid|delivery/);
  expect(requests.some(url => url.includes('/api/') || url.includes('example.invalid'))).toBe(false);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:8872')).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await expect(page.getByRole('button', { name: 'Edit message', exact: true })).toHaveCount(0);
});

test('Pages navigation survives direct load and refresh at the repository subpath', async ({ page }) => {
  await page.goto('/clearmessage-evohacks/');
  await page.getByRole('link', { name: 'How it works', exact: true }).click();
  await expect(page).toHaveURL(/\/clearmessage-evohacks\/\?view=how-it-works$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'How ClearMessage works', exact: true })).toBeVisible();
  await expect(page.getByText('Recorded demo · no live analysis', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Try an example', exact: true })).toBeVisible();
});

test('recorded result and project page reflow at 320px and 200% text size', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/clearmessage-evohacks/');
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.critical-limits')).toBeVisible();
  await page.goto('/clearmessage-evohacks/project/');
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('heading', { name: 'What we actually measured.', exact: true })).toBeVisible();
  await page.getByText('Inspect class results and the confusion matrix', { exact: true }).click();
  await expect(page.getByRole('table')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
