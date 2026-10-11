import { describe, expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { analyze, AnalysisError, MAX_TEXT_LENGTH, parseResponse, validateText } from './api';

const missingModel = {
  status: 'review', analysis_complete: false, headline_key: 'model_not_ready',
  evidence: [], action_keys: ['verify_independently'],
  limitations: ['model_not_ready', 'language_not_evaluated', 'not_a_safety_confirmation'],
  message_language: 'en', model_version: null, policy_version: 'analysis-policy-2',
  contract_version: '1.1.0', share_summary_keys: ['analysis_not_completed', 'help_verify_independently'],
};
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('input limits and incomplete results', () => {
  it('keeps the client input limit aligned with the canonical OpenAPI contract', () => {
    const schema = JSON.parse(readFileSync(new URL('../../docs/openapi.json', import.meta.url), 'utf8'));
    expect(MAX_TEXT_LENGTH).toBe(schema.components.schemas.AnalyzeRequest.properties.text.maxLength);
  });
  it('rejects empty, whitespace and overlong input without truncating Unicode', () => {
    expect(validateText('')).toBe('empty');
    expect(validateText(' \n\t')).toBe('empty');
    expect(validateText('😀'.repeat(2000))).toBeNull();
    expect(validateText('😀'.repeat(2001))).toBe('too_long');
  });
  it('accepts an explicit absence of model', () => {
    expect(parseResponse(missingModel)).toEqual(missingModel);
  });
  it.each([null, {}, { ...missingModel, status: 'no_strong_signals' },
    { ...missingModel, analysis_complete: true }, { ...missingModel, limitations: [] },
    { ...missingModel, action_keys: ['unknown_key'] },
    { ...missingModel, evidence: ['FIKTIVNI_PRIVATE_TEXT'] },
  ])('rejects malformed or falsely reassuring responses', value => {
    expect(() => parseResponse(value)).toThrow(AnalysisError);
  });
  it('sends a POST body and never includes text in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(missingModel)));
    vi.stubGlobal('fetch', fetchMock);
    await analyze({ text: 'Fictional English sample', message_language: 'en' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/analyze');
    expect(options.method).toBe('POST');
    expect(options.cache).toBe('no-store');
    expect(JSON.parse(options.body).message_language).toBe('en');
  });
  it('does not call backend for invalid text', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(analyze({ text: ' ', message_language: 'auto' })).rejects.toMatchObject({ key: 'empty' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('replaces transport exception text with a fixed key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('FIKTIVNI_PRIVATE_TEXT')));
    await expect(analyze({ text: 'Fictional sample', message_language: 'auto' })).rejects.toThrow(/^unavailable$/);
  });
  it('propagates cancellation without exposing private transport errors', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('PRIVATE_ABORT_CANARY')));
    })));
    const promise = analyze({ text: 'Fictional sample', message_language: 'en' }, controller.signal);
    const rejected = expect(promise).rejects.toThrow(/^unavailable$/);
    controller.abort();
    await rejected;
  });
  it('bounds stalled transport to ten seconds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('PRIVATE_TIMEOUT_CANARY')));
    })));
    const rejected = expect(analyze({ text: 'Fictional sample', message_language: 'en' })).rejects.toThrow(/^unavailable$/);
    await vi.advanceTimersByTimeAsync(10_000);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('real analysis response boundaries', () => {
  const provisional = { ...missingModel, model_version: 'clearmessage-sparse-v1:7fe727cfb786', headline_key: 'review_required',
    limitations: ['human_review_incomplete', 'language_not_evaluated', 'policy_not_validated', 'not_a_safety_confirmation'] };
  const warning = { ...provisional, status: 'suspicious', headline_key: 'suspicious_signals', evidence: [{ key: 'request_for_secret', basis: 'observed_text_signal' }] };
  it('accepts honest limited model and observed rule warnings', () => {
    expect(parseResponse(provisional)).toEqual(provisional);
    expect(parseResponse(warning)).toEqual(warning);
  });
  it('keeps a completed low-finding contract distinct and rejects false help completion', () => {
    // Future valid contract fixture only; no production policy was enabled.
    const completed = { ...provisional, status: 'no_strong_signals', analysis_complete: true,
      headline_key: 'no_strong_signals', limitations: ['not_a_safety_confirmation'],
      share_summary_keys: ['help_verify_independently'] };
    expect(parseResponse(completed)).toEqual(completed);
    expect(() => parseResponse({ ...completed, share_summary_keys: ['analysis_not_completed', 'help_verify_independently'] })).toThrow(AnalysisError);
  });
  it.each([
    { ...provisional, analysis_complete: true },
    { ...warning, evidence: [] },
    { ...warning, status: 'review', headline_key: 'review_required' },
    { ...warning, evidence: [{ key: 'model_signal', basis: 'classifier' }], message_language: 'other' },
    { ...warning, policy_version: 'analysis-policy-1' },
    { ...warning, evidence: [{ key: 'request_for_secret', basis: 'classifier' }] },
    { ...warning, evidence: [{ key: 'request_for_secret', basis: 'observed_text_signal', snippet: 'PRIVATE_CANARY' }] },
    { ...warning, share_summary_keys: ['PRIVATE_CANARY'] },
    { ...provisional, source_text: 'PRIVATE_CANARY' },
    { ...provisional, status: 'no_strong_signals', headline_key: 'no_strong_signals' },
    { ...provisional, share_summary_keys: [] },
    { ...provisional, limitations: ['incomplete_coverage', 'not_a_safety_confirmation'], status: 'suspicious', headline_key: 'suspicious_signals', evidence: [{key: 'model_signal', basis: 'classifier'}] },
  ])('rejects drift, invented evidence, private payloads or false completion', value => {
    expect(() => parseResponse(value)).toThrow(AnalysisError);
  });
});
