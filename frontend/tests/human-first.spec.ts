import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const example = 'Your delivery is waiting. Pay the invoice immediately to release your parcel. Visit https://example.invalid/delivery.';
const model = 'clearmessage-sparse-v1:b6e56c3f1d34';
const why = (page: Page) => page.getByRole('button', { name: 'Why this result?', exact: true });
const checkedMessage = (page: Page) => page.locator('.message-bubble-text');

async function openPaste(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Paste a message', exact: true }).click();
}
async function checkText(page: Page, text: string) {
  await page.getByLabel('Message text', { exact: true }).fill(text);
  await page.getByLabel('Message language', { exact: true }).selectOption('en');
  const response = page.waitForResponse(item => item.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message', exact: true }).click();
  const actual = await response;
  expect(actual.status()).toBe(200);
  expect(actual.request().postDataJSON()).toEqual({ text, message_language: 'en' });
  await expect(page.locator('.result')).toBeVisible();
  return actual;
}

type SpeechHarness = { spoken: { text: string; lang: string; voiceName: string | null }[]; cancelled: number };
async function mockSpeech(page: Page) {
  // Only this test fixture replaces browser speech. Production has no mock voice.
  await page.addInitScript(() => {
    const state: SpeechHarness = { spoken: [], cancelled: 0 };
    (window as unknown as { speechHarness: SpeechHarness }).speechHarness = state;
    class TestUtterance {
      text: string;
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
      onend: ((event: SpeechSynthesisEvent) => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
      constructor(text: string) { this.text = text; }
    }
    const voices = [
      { name: 'TEST_ONLY_REMOTE_ENGLISH', lang: 'en-US', localService: false, default: true },
      { name: 'TEST_ONLY_LOCAL_ENGLISH', lang: 'en-GB', localService: true, default: false },
    ];
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: TestUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices,
      cancel: () => { state.cancelled++; },
      speak: (utterance: SpeechSynthesisUtterance) => {
        state.spoken.push({ text: utterance.text, lang: utterance.lang, voiceName: utterance.voice?.name ?? null });
        utterance.onstart?.(new Event('start') as SpeechSynthesisEvent);
      },
    } });
  });
}
const speechState = (page: Page) => page.evaluate(() => (window as unknown as { speechHarness: SpeechHarness }).speechHarness);

test('human-first home has two large choices and a keyboard path at 360px with reduced motion', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not sure about a message?');
  await expect(page.getByText("Let's check it together.", { exact: true })).toBeVisible();
  await expect(page.getByLabel('Message text', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Try an example', exact: true })).toBeVisible();
  await expect(page.locator('.home-choice')).toHaveCount(2);
  for (const button of await page.locator('.home-choice').all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(56);
    expect(await button.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'ClearMessage', exact: true }).focus();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'How it works', exact: true })).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('button', { name: 'Upload a screenshot', exact: true })).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('button', { name: 'Paste a message', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Message text', { exact: true })).toBeFocused();
  await expect(page.getByText(/Text is sent to our backend/)).toBeVisible();
});

test('one-tap fictional example calls the real model and explains an observed delivery payment request', async ({ page, baseURL }) => {
  const destinations: string[] = [];
  page.on('request', request => destinations.push(request.url()));
  await page.goto('/');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  const response = await responsePromise;
  expect(response.request().postDataJSON()).toEqual({ text: example, message_language: 'en' });
  const result = await response.json();
  expect(result).toMatchObject({ model_version: model, analysis_complete: false, status: 'suspicious' });
  expect(result.evidence).toContainEqual(expect.objectContaining({ key: 'payment_pressure', basis: 'observed_text_signal' }));
  await expect(page.getByText('Example message', { exact: true })).toBeVisible();
  await expect(why(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.message-bubble')).toHaveCount(0);
  await expect(page.getByText('Limited check · analysis is incomplete', { exact: true })).toBeVisible();
  await expect(page.getByText('Performance is unverified in every language, including English.', { exact: true })).toBeVisible();
  await expect(page.getByText('This output does not establish message safety.', { exact: true })).toBeVisible();
  await why(page).focus(); await page.keyboard.press('Enter');
  await expect(why(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(why(page)).toBeFocused();
  await expect(checkedMessage(page)).toHaveText(example);
  await expect(page.getByText('Possible pattern', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Delivery payment request', exact: true })).toBeVisible();
  await expect(page.getByText('This is context for an observed request, not confirmation of fraud or the sender’s identity.', { exact: true })).toBeVisible();
  await expect(page.locator('.message-bubble a')).toHaveCount(0);
  const nativeSpeech = await page.evaluate(() => {
    const supported = Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function');
    const voices = supported ? window.speechSynthesis.getVoices() : [];
    return { api: supported, initialVoices: voices.length, initialEnglishVoices: voices.filter(voice => /^en(?:[-_]|$)/i.test(voice.lang)).length,
      initialLocalEnglishVoices: voices.filter(voice => /^en(?:[-_]|$)/i.test(voice.lang) && voice.localService).length };
  });
  // Presence/inventory is real platform observation, separate from mock playback.
  test.info().annotations.push({ type: 'native-speech-platform', description: JSON.stringify(nativeSpeech) });
  console.log('NATIVE_SPEECH_PLATFORM', JSON.stringify(nativeSpeech));
  expect(destinations.every(url => new URL(url).origin === new URL(baseURL!).origin)).toBe(true);
  expect(destinations.some(url => url.includes('example.invalid'))).toBe(false);
});

test('a failed new example clears its previous result and never simulates a verdict', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await expect(page.locator('.result')).toBeVisible();
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await page.route('**/api/analyze', route => route.abort());
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Analysis was not performed');
  await expect(page.locator('.result')).toHaveCount(0);
  await expect(page.locator('.message-bubble')).toHaveCount(0);
  await expect(page.getByText('Example message', { exact: true })).toBeVisible();
});

test('simple view keeps insufficient-text and unavailable-model uncertainty visible', async ({ page }) => {
  await openPaste(page); await checkText(page, 'Hi');
  await expect(why(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('There is too little text for the model to check.', { exact: true })).toBeVisible();
  await expect(page.getByText('This output does not establish message safety.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit message', exact: true }).click();
  // Service failure fixture only. Genuine inference is exercised in other cases.
  await page.route('**/api/analyze', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    status: 'review', analysis_complete: false, headline_key: 'model_not_ready', evidence: [],
    action_keys: ['verify_independently'], limitations: ['model_not_ready', 'rules_only', 'not_a_safety_confirmation'],
    message_language: 'en', model_version: null, policy_version: 'analysis-policy-2', contract_version: '1.1.0',
    share_summary_keys: ['analysis_not_completed', 'help_verify_independently'],
  }) }));
  await checkText(page, 'A fictional ordinary message for unavailable-model testing.');
  await expect(page.locator('.result-label')).toContainText('Analysis not performed');
  await expect(page.getByText('The model check was not performed.', { exact: true })).toBeVisible();
  await expect(why(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('No strong warning signs found', { exact: true })).toHaveCount(0);
});

test('verified Unicode bubble highlights are keyboard selectable and hostile message text remains inert', async ({ page, baseURL }) => {
  const text = '😀 Please send me your login code.\n<img src="https://notice.invalid/pixel" onerror="alert(1)">\nPlease send me your login code.';
  const destinations: string[] = [];
  page.on('request', request => destinations.push(request.url()));
  await openPaste(page);
  const response = await checkText(page, text);
  const result = await response.json();
  await why(page).click();
  await expect(checkedMessage(page)).toHaveText(text);
  const highlight = page.locator('.message-bubble').getByRole('button', { name: 'A request for a password or code', exact: true });
  const span = result.evidence.find((item: { key: string }) => item.key === 'request_for_secret').span;
  await expect(highlight).toHaveText(Array.from(text).slice(span.start, span.end).join(''));
  await highlight.focus(); await page.keyboard.press('Enter');
  await expect(highlight).toBeFocused();
  await expect(highlight).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'A request for a password or code', exact: true })).toContainText('Observed textual signal');
  await page.keyboard.press('Enter');
  await expect(highlight).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('region', { name: 'A request for a password or code', exact: true })).toHaveCount(0);
  await expect(page.locator('.message-bubble img,.message-bubble a,.message-bubble script')).toHaveCount(0);
  expect(destinations.every(url => new URL(url).origin === new URL(baseURL!).origin)).toBe(true);
});

test('automatic and manual masks remove source characters from every DOM field without changing analysis', async ({ page }) => {
  const text = '😀 Please send me your login code. Email: privacy_canary@example.invalid. Verification code: 845921. Mara Manualperson';
  let posts = 0;
  page.on('request', request => { if (request.url().endsWith('/api/analyze')) posts++; });
  await openPaste(page); await checkText(page, text); await why(page).click();
  await expect(checkedMessage(page)).toContainText('privacy_canary@example.invalid');
  await page.getByRole('button', { name: 'Hide personal details', exact: true }).click();
  expect(await page.content()).not.toMatch(/privacy_canary@example\.invalid|845921/);
  await expect(page.getByText('Personal details are masked in this display. The check used the original text.', { exact: true })).toBeVisible();
  await page.getByText('Privacy controls', { exact: true }).click();
  await page.getByRole('button', { name: 'Choose more text to hide', exact: true }).click();
  const selection = page.getByLabel('Select text to hide', { exact: true });
  await expect(selection).toHaveAttribute('readonly', '');
  expect(await selection.inputValue()).not.toMatch(/privacy_canary@example\.invalid|845921/);
  await page.getByRole('button', { name: 'Hide selected text', exact: true }).click();
  await expect(page.getByText('Select some text in the box first.', { exact: true })).toBeVisible();
  const displayed = await selection.inputValue();
  const start = displayed.indexOf('Mara Manualperson');
  expect(start).toBeGreaterThan(0);
  await selection.evaluate((element, range) => { const field = element as HTMLTextAreaElement; field.focus(); field.setSelectionRange(range.start, range.end); },
    { start, end: start + 'Mara Manualperson'.length });
  await page.getByRole('button', { name: 'Hide selected text', exact: true }).click();
  await expect(selection).toBeFocused();
  await expect(page.getByText('Selected text is hidden.', { exact: true })).toBeVisible();
  expect(await page.content()).not.toMatch(/privacy_canary@example\.invalid|845921|Mara Manualperson/);
  expect(await page.locator('textarea').evaluateAll(elements => elements.map(element => (element as HTMLTextAreaElement).value).join(' '))).not.toMatch(/privacy_canary@example\.invalid|845921|Mara Manualperson/);
  expect(posts).toBe(1);
  await page.getByRole('button', { name: 'Edit message', exact: true }).click();
  await expect(page.getByLabel('Message text', { exact: true })).toHaveValue(text);
  await checkText(page, text); await why(page).click();
  await expect(checkedMessage(page)).toHaveText(text);
  await expect(page.getByRole('button', { name: 'Hide personal details', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await why(page).click();
  await expect(checkedMessage(page)).toHaveText(example);
  expect(await page.content()).not.toContain('privacy_canary@example.invalid');
  expect(posts).toBe(3);
});

test('masked source never enters neutral preview or native sharing, which still requires gestures', async ({ page }) => {
  await page.addInitScript(() => {
    const shared: ShareData[] = [];
    (window as unknown as { sharedDrafts: ShareData[] }).sharedDrafts = shared;
    Object.defineProperty(navigator, 'share', { value: async (payload: ShareData) => { shared.push(payload); } });
  });
  await openPaste(page);
  await checkText(page, 'Please send me your login code. Email: share_canary@example.invalid. Verification code: 912845.');
  await why(page).click();
  await page.getByRole('button', { name: 'Hide personal details', exact: true }).click();
  await expect(page.getByLabel('Help request preview', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { sharedDrafts: ShareData[] }).sharedDrafts)).toEqual([]);
  await page.getByRole('button', { name: 'Ask someone for help', exact: true }).click();
  const draft = await page.getByLabel('Help request preview', { exact: true }).inputValue();
  expect(draft).not.toMatch(/share_canary|912845|login|https?:/);
  expect(await page.evaluate(() => (window as unknown as { sharedDrafts: ShareData[] }).sharedDrafts)).toEqual([]);
  await page.getByRole('button', { name: 'Share help request', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { sharedDrafts: ShareData[] }).sharedDrafts)).toEqual([{ text: draft }]);
  expect(await page.content()).not.toMatch(/share_canary@example\.invalid|912845/);
});

test('gesture-only speech reads fixed guidance and stops on control, edits and navigation events', async ({ page }) => {
  await mockSpeech(page);
  const source = 'Please send me your login code. RAW_SPEECH_CANARY 845921 https://notice.invalid/private';
  await openPaste(page); await checkText(page, source);
  expect((await speechState(page)).spoken).toEqual([]);
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop reading', exact: true })).toBeVisible();
  let state = await speechState(page);
  expect(state.spoken).toHaveLength(1);
  expect(state.spoken[0]).toMatchObject({ lang: 'en', voiceName: 'TEST_ONLY_LOCAL_ENGLISH' });
  expect(state.spoken[0].text).toContain('analysis is incomplete');
  expect(state.spoken[0].text).toContain('does not establish message safety');
  expect(state.spoken[0].text).not.toMatch(/RAW_SPEECH_CANARY|845921|notice\.invalid/);
  let stopped = state.cancelled;
  await page.getByRole('button', { name: 'Stop reading', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeVisible();
  expect((await speechState(page)).cancelled).toBeGreaterThan(stopped);
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  stopped = (await speechState(page)).cancelled;
  await page.getByRole('button', { name: 'Edit message', exact: true }).click();
  expect((await speechState(page)).cancelled).toBeGreaterThan(stopped);
  await expect(page.getByRole('button', { name: 'Stop reading', exact: true })).toHaveCount(0);
  await checkText(page, source);
  expect((await speechState(page)).spoken).toHaveLength(2);
  for (const event of ['popstate', 'pagehide']) {
    await page.getByRole('button', { name: 'Listen', exact: true }).click();
    stopped = (await speechState(page)).cancelled;
    // Test dispatch checks the hook's actual page lifecycle listeners, without
    // claiming an audible voice or a physical-device navigation observation.
    await page.evaluate(name => window.dispatchEvent(new Event(name)), event);
    await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeVisible();
    expect((await speechState(page)).cancelled).toBeGreaterThan(stopped);
  }
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  stopped = (await speechState(page)).cancelled;
  await page.getByRole('button', { name: 'Start again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Not sure about a message?', exact: true })).toBeFocused();
  expect((await speechState(page)).cancelled).toBeGreaterThan(stopped);
  state = await speechState(page);
  expect(state.spoken.every(item => !/RAW_SPEECH_CANARY|845921|notice\.invalid/.test(item.text))).toBe(true);
});

test('unsupported speech offers readable guidance without a working Listen control', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Try an example', exact: true }).click();
  await expect(page.locator('.result')).toBeVisible();
  await expect(page.getByText('Reading aloud is not available in this browser.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Listen', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your next step', exact: true })).toBeVisible();
});

test('ordinary or negated context never forces a scam pattern, even alongside an observed request', async ({ page }) => {
  await openPaste(page);
  const messages = ['A fictional lunch plan for tomorrow.', 'This is not a delivery notice. Pay the invoice immediately.', 'Never share your code. Your delivery arrives tomorrow.'];
  for (const [index, text] of messages.entries()) {
    if (index) await page.getByRole('button', { name: 'Edit message', exact: true }).click();
    const response = await checkText(page, text);
    const result = await response.json();
    expect(result.model_version).toBe(model);
    expect(result.analysis_complete).toBe(false);
    if (index === 1) expect(result.evidence).toContainEqual(expect.objectContaining({ key: 'payment_pressure', basis: 'observed_text_signal' }));
    await why(page).click();
    await expect(page.locator('.possible-pattern')).toHaveCount(0);
    await expect(page.getByText('This output does not establish message safety.', { exact: true }).first()).toBeVisible();
  }
});

test('real screenshot review and masked result never render the private screenshot as a preview', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Upload a screenshot', exact: true }).click();
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1100; canvas.height = 200;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'white'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#111827'; context.font = '36px Arial';
    context.fillText('Please send me your login code.', 40, 65);
    context.fillText('Fictional screenshot for privacy testing.', 40, 140);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Choose screenshot', { exact: true }).setInputFiles({ name: 'fictional-privacy.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
  const review = page.getByLabel('Review the extracted text', { exact: true });
  await expect(review).toHaveValue(/Please send me your login code/, { timeout: 60_000 });
  await expect(page.locator('.interaction img')).toHaveCount(0);
  const text = `${await review.inputValue()}\nEmail: screenshot_mask@example.invalid.`;
  await review.fill(text);
  await page.getByLabel('I reviewed this text and removed sensitive details.').check();
  const response = page.waitForResponse(item => item.url().endsWith('/api/analyze'));
  await page.getByRole('button', { name: 'Check message', exact: true }).click();
  expect((await (await response).json()).model_version).toBe(model);
  await why(page).click();
  await page.getByRole('button', { name: 'Hide personal details', exact: true }).click();
  await expect(page.locator('.interaction img')).toHaveCount(0);
  await expect(review).toHaveCount(0);
  expect(await page.content()).not.toContain('screenshot_mask@example.invalid');
});
