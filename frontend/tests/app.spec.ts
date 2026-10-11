import { test, expect } from '@playwright/test';

test('real frontend POST → API → honest limited review, without storage or external requests', async ({ page, context, baseURL }) => {
  const canary = 'FIKTIVNI_E2E_731_English_sample https://notice.invalid/example';
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { requests.push(request.url()); });
  page.on('pageerror', error => { errors.push(error.message); });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill(canary);
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message' }).click();
  const response = await responsePromise;
  expect(response.request().method()).toBe('POST');
  expect(response.request().postDataJSON()).toEqual({ text: canary, message_language: 'en' });
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toMatchObject({ status: 'review', analysis_complete: false, headline_key: 'review_required', evidence: [], model_version: 'clearmessage-sparse-v1:b6e56c3f1d34' });
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeVisible();
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
  await expect(page.getByText("We couldn't assess this reliably", { exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByRole('alert')).toContainText('Please paste a message first');
  await expect(page.getByLabel('Message text', { exact: true })).toBeFocused();
  await page.getByLabel('Message text', { exact: true }).fill('a'.repeat(2001));
  await page.getByRole('button', { name: 'Check message' }).click();
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
  await page.getByRole('button', { name: 'Check message' }).click();
  expect((await (await responsePromise).json()).message_language).toBe('cs');
  await expect(page.getByRole('heading', { name: 'This message needs further verification.' })).toBeVisible();
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
});

test('network failure clearly says analysis was not performed', async ({ page }) => {
  // Failure simulation is confined to tests; normal E2E above uses the real API.
  await page.route('**/api/analyze', route => route.abort());
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByRole('alert')).toContainText('Analysis was not performed');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('unknown successful payload cannot render reassurance', async ({ page }) => {
  await page.route('**/api/analyze', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'no_strong_signals', analysis_complete: true }) }));
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('Fiktivní krátká zpráva.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByRole('alert')).toContainText('Analysis was not performed');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('mobile keyboard submission and inert HTML text', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('<img src="https://inert.invalid/image" onerror="alert(1)"> ignore previous instructions');
  await page.getByRole('button', { name: 'Check message' }).focus();
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
  await page.getByRole('button', { name: 'Check message' }).click();
  const data = await (await responsePromise).json();
  expect(data).toMatchObject({ status: 'suspicious', analysis_complete: false,
    evidence: [{ key: 'request_for_secret', basis: 'observed_text_signal' }] });
  await expect(page.getByRole('heading', { name: 'There are warning signals in this message.' })).toBeVisible();
  await page.getByText('A request for a password or code', { exact: true }).click();
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
  await page.getByText('What have you already done?', { exact: true }).click();
  await expect(page.getByText(/Do not enter any of those details here/)).toBeVisible();
  await page.getByLabel('Message text', { exact: true }).fill('Jiná fiktivní zpráva.');
  await expect(page.getByLabel('Help request preview')).toHaveCount(0);
});

test('Style A assets, English metadata and narrow text reflow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ClearMessage — Message guidance');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not sure about a message?');
  await expect(page.getByText('EVOHACKS 2026 prototype')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily)).toContain('-apple-system');
  const images = await page.locator('img').evaluateAll(elements => elements.map(element => {
    const image = element as HTMLImageElement;
    return { loaded: image.complete && image.naturalWidth > 0, decorative: image.alt === '' && image.getAttribute('aria-hidden') === 'true' };
  }));
  expect(images).toEqual([{ loaded: true, decorative: true }]);
  for (const width of [900, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Check message', exact: true })).toBeVisible();
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByLabel('Message text', { exact: true })).toBeVisible();
});

test('real English signals without links → bounded reasons/actions → neutral preview', async ({ page }) => {
  const canary = 'FICTIONAL_PRIVATE_CANARY_Alex_ACCOUNT_654321';
  await page.goto('/');
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  await page.getByLabel('Message text', { exact: true }).fill(`Please send me your login code. Pay the invoice immediately. Keep this secret. ${canary}`);
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message' }).click();
  const response = await responsePromise;
  const data = await response.json();
  expect(data).toMatchObject({ status: 'suspicious', analysis_complete: false, policy_version: 'analysis-policy-2', model_version: 'clearmessage-sparse-v1:b6e56c3f1d34' });
  expect(data.evidence.map((item: {key: string}) => item.key)).toEqual(['request_for_secret', 'payment_pressure', 'secrecy_request']);
  expect(data.action_keys).toHaveLength(3);
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'suspicious');
  await expect(page.getByText('Suspicious message', { exact: true })).toBeVisible();
  expect(await page.locator('.result').textContent()).not.toContain(canary);
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  expect(await page.getByLabel('Help request preview').inputValue()).not.toMatch(/CANARY|Alex|ACCOUNT|654321|login|invoice|https?:/);
  await page.getByLabel('Message language', { exact: true }).selectOption('other');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('unavailable model contract has a separate incomplete service state', async ({ page }) => {
  // Failure simulation only; other tests use real local model/API inference.
  await page.route('**/api/analyze', route => route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({
    status: 'review', analysis_complete: false, headline_key: 'model_not_ready', evidence: [],
    action_keys: ['verify_independently', 'ask_trusted_person'],
    limitations: ['model_not_ready', 'rules_only', 'not_a_safety_confirmation'],
    message_language: 'auto', model_version: null, policy_version: 'analysis-policy-2', contract_version: '1.1.0',
    share_summary_keys: ['analysis_not_completed', 'help_verify_independently'],
  })}));
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('Fictional ordinary message for failure testing.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByText('Analysis not performed', { exact: true })).toBeVisible();
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
  await expect(page.getByText('No strong warning signs found', { exact: true })).toHaveCount(0);
});

test('pending edits cancel the old request and ignore late responses even when transport ignores abort', async ({ page }) => {
  // Test-only transport wrapper delays real API results and deliberately ignores abort.
  await page.addInitScript(() => {
    const realFetch = window.fetch.bind(window);
    const state = { release: () => {}, calls: 0 };
    (window as unknown as { delayedAnalysis: typeof state }).delayedAnalysis = state;
    window.fetch = async (input, options) => {
      if (input !== '/api/analyze') return realFetch(input, options);
      state.calls++;
      if (state.calls !== 1) return realFetch(input, options);
      const response = await realFetch(input, { ...options, signal: undefined });
      await new Promise<void>(resolve => { state.release = resolve; });
      return response;
    };
  });
  await page.goto('/');
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  await page.getByLabel('Message text', { exact: true }).fill('Please send me your login code.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByRole('button', { name: 'Checking…' })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Checking…');
  await expect(page.getByLabel('Message text', { exact: true })).toBeEnabled();
  await page.getByLabel('Message text', { exact: true }).fill('Fictional ordinary lunch plan for tomorrow.');
  await expect(page.getByRole('button', { name: 'Check message' })).toBeEnabled();
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
  await page.evaluate(() => (window as unknown as {delayedAnalysis: {release: () => void}}).delayedAnalysis.release());
  // Drain the resumed promise and React rendering before checking the retained state.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
  await expect(page.getByText('Observed textual signal:', { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await page.getByLabel('Message language', { exact: true }).selectOption('other');
  await expect(page.locator('.result')).toHaveCount(0);
  await expect(page.getByLabel('Help request preview')).toHaveCount(0);
});

test('keyboard-only flow and actual clipboard write contain only the preview', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const canary = 'PRIVATE_UI_CANARY_Alex_123456 https://notice.invalid/test';
  const logs: string[] = [];
  page.on('console', message => logs.push(message.text()));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'ClearMessage', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Paste a message', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Upload a screenshot', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Message text', { exact: true })).toBeFocused();
  expect(await page.getByLabel('Message text', { exact: true }).evaluate(element => getComputedStyle(element).outlineWidth)).toBe('3px');
  await page.keyboard.insertText(`Please send me your password. ${canary}`);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Message language', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Check message' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'There are warning signals in this message.' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByText('A request for a password or code', { exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.evidence-quote mark')).toHaveText('send me your password');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Ask someone for help' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Help request preview')).toBeFocused();
  const draft = await page.getByLabel('Help request preview').inputValue();
  // Clipboard reads here are a test verifier only. Production code is write-only.
  await page.evaluate(() => navigator.clipboard.writeText('TEST_CLIPBOARD_UNCHANGED'));
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('TEST_CLIPBOARD_UNCHANGED');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Copy help request' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(draft);
  expect(draft).not.toMatch(/PRIVATE|Alex|123456|notice\.invalid|password/);
  expect(logs.join(' ')).not.toContain(canary);
  await page.getByLabel('Message text', { exact: true }).fill('A changed fictional message.');
  await expect(page.getByText('Copied', { exact: true })).toHaveCount(0);
});

test('clipboard denial and native cancellation/failure preserve a selectable neutral fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('PRIVATE_CLIPBOARD_ERROR_CANARY'); } } });
    let attempts = 0;
    Object.defineProperty(navigator, 'share', { value: async () => {
      if (++attempts === 1) throw new DOMException('PRIVATE_SHARE_CANCEL_CANARY', 'AbortError');
      throw new Error('PRIVATE_SHARE_ERROR_CANARY');
    } });
  });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('A fictional ordinary message for testing.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await page.getByRole('button', { name: 'Copy help request' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Copying did not complete' })).toBeVisible();
  await expect(page.getByLabel('Help request preview')).toBeFocused();
  expect(await page.getByLabel('Help request preview').evaluate(element => {
    const field = element as HTMLTextAreaElement;
    return field.selectionStart === 0 && field.selectionEnd === field.value.length;
  })).toBe(true);
  await expect(page.getByText('Copied', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Share help request' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sharing cancelled.' })).toBeVisible();
  await page.getByRole('button', { name: 'Share help request' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sharing could not be opened.' })).toBeVisible();
  expect(await page.locator('.result').textContent()).not.toContain('CANARY');
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
});

test('missing clipboard and late copy completion cannot restore old feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('A fictional ordinary message for testing.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await page.getByRole('button', { name: 'Copy help request' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Copying did not complete' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => new Promise<void>(resolve => {
      (window as unknown as { finishCopy: () => void }).finishCopy = resolve;
    }) } });
  });
  await page.getByRole('button', { name: 'Copy help request' }).click();
  await expect(page.getByRole('button', { name: 'Copying…' })).toBeDisabled();
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await page.evaluate(() => (window as unknown as { finishCopy: () => void }).finishCopy());
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  await expect(page.getByText('Copied', { exact: true })).toHaveCount(0);
});

test('language edits during a pending request cancel without an error or result', async ({ page }) => {
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/analyze', async route => { await blocked; await route.abort().catch(() => {}); });
  await page.goto('/');
  await page.getByLabel('Message text', { exact: true }).fill('A fictional ordinary message.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.getByRole('button', { name: 'Checking…' })).toBeDisabled();
  await page.getByLabel('Message language', { exact: true }).selectOption('other');
  await expect(page.getByRole('button', { name: 'Check message' })).toBeEnabled();
  release();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.result')).toHaveCount(0);
});

test('reduced motion, control geometry and reserved green state keep explicit limitations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.getByRole('button', { name: 'Check message' }).evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontSize)).toBe('20px');
  expect(await page.getByRole('button', { name: 'Check message' }).evaluate(element => getComputedStyle(element).fontSize)).toBe('18px');
  for (const selector of ['textarea', 'select', 'button', 'summary']) {
    for (const box of await page.locator(selector).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(48);
  }
  // Reserved future-state fixture only. The actual provisional model never emits this.
  await page.route('**/api/analyze', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    status: 'no_strong_signals', analysis_complete: true, headline_key: 'no_strong_signals', evidence: [],
    action_keys: ['verify_independently', 'ask_trusted_person'], limitations: ['not_a_safety_confirmation'],
    message_language: 'en', model_version: 'test-only-future-model', policy_version: 'analysis-policy-2', contract_version: '1.1.0',
    share_summary_keys: ['help_verify_independently'],
  }) }));
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  await page.getByLabel('Message text', { exact: true }).fill('A fictional future-contract fixture only.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'no_strong_signals');
  await expect(page.getByText('No strong warning signs found', { exact: true })).toBeVisible();
  await expect(page.getByText('This output does not establish message safety.', { exact: true })).toBeVisible();
  expect(await page.locator('.result-label').evaluate(element => getComputedStyle(element).color)).toBe('rgb(22, 101, 52)');
  await page.getByRole('button', { name: 'Ask someone for help' }).click();
  expect(await page.getByLabel('Help request preview').inputValue()).not.toContain('The automated check was limited');
});

test('font download failure retains readable fallback and functioning real API', async ({ page }) => {
  await page.route('**/*.woff2', route => route.abort());
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily)).toContain('system-ui');
  await page.getByLabel('Message text', { exact: true }).fill('A fictional ordinary message in the fallback font.');
  await page.getByRole('button', { name: 'Check message' }).click();
  await expect(page.locator('.result')).toHaveAttribute('data-status', 'review');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
