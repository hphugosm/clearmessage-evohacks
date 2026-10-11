import { describe, expect, it, vi } from 'vitest';
import type { AnalyzeResponse } from './api';
import { copy } from './copy';
import { buildResultSpeech, createReadAloudController } from './speech';
import type { SpeechPlatform, SpeechState } from './speech';

const result: AnalyzeResponse = {
  status: 'suspicious', analysis_complete: false, headline_key: 'suspicious_signals',
  evidence: [{ key: 'request_for_secret', basis: 'observed_text_signal', span: { start: 0, end: 22 } }],
  action_keys: ['do_not_send_secrets', 'verify_independently'],
  limitations: ['language_not_evaluated', 'not_a_safety_confirmation'],
  message_language: 'en', model_version: 'PRIVATE_CANARY_654321 https://example.invalid/a',
  policy_version: 'analysis-policy-2', contract_version: '1.1.0',
  share_summary_keys: ['analysis_not_completed', 'help_verify_independently'],
};

function fixture(voices: SpeechSynthesisVoice[] = []) {
  const utterances: SpeechSynthesisUtterance[] = [];
  const synthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn(() => voices) };
  const platform: SpeechPlatform = { synthesis, createUtterance: vi.fn((text: string) => {
    const utterance = { text, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
    utterances.push(utterance);
    return utterance;
  }) };
  const states: SpeechState[] = [];
  const controller = createReadAloudController(platform, state => states.push(state));
  return { controller, platform, synthesis, utterances, states };
}

function voice(lang: string, localService: boolean, isDefault = false): SpeechSynthesisVoice {
  return { lang, localService, default: isDefault } as SpeechSynthesisVoice;
}

const event = {} as SpeechSynthesisEvent;
const errorEvent = { error: 'synthesis-failed' } as SpeechSynthesisErrorEvent;

describe('approved result speech', () => {
  it('speaks fixed guidance and critical uncertainty, never spans or arbitrary response content', () => {
    const text = buildResultSpeech({ ...result, source_text: 'PRIVATE_SOURCE 123456 person@example.invalid' } as AnalyzeResponse);
    expect(text).toContain(copy.headlines.suspicious_signals);
    expect(text).toContain(copy.incomplete);
    expect(text).toContain(copy.experience.critical.language_not_evaluated);
    expect(text).toContain('It asks for a password or verification code.');
    expect(text).toContain('Do not share passwords or verification codes');
    expect(text).toContain(copy.limitations.not_a_safety_confirmation);
    expect(text).not.toMatch(/PRIVATE_|654321|123456|example\.invalid|person@/);
  });
  it('retains service and input-coverage limitations without reading additional source fields', () => {
    const text = buildResultSpeech({ ...result, limitations: ['model_not_ready', 'incomplete_coverage', 'language_not_evaluated', 'not_a_safety_confirmation'] });
    expect(text).toContain(copy.experience.critical.model_not_ready);
    expect(text).toContain(copy.experience.critical.incomplete_coverage);
    expect(text).toContain(copy.experience.critical.language_not_evaluated);
  });
  it('declines injected speech keys using a fixed error, without reflecting them', () => {
    expect(() => buildResultSpeech({ ...result, headline_key: 'PRIVATE_CANARY_654321' } as unknown as AnalyzeResponse)).toThrow(/^invalid_speech_keys$/);
    expect(() => buildResultSpeech({ ...result, action_keys: ['PRIVATE_CANARY_654321'] } as unknown as AnalyzeResponse)).toThrow(/^invalid_speech_keys$/);
  });
});

describe('read-aloud lifecycle', () => {
  it('does not speak or create an utterance until an explicit start', () => {
    const { controller, synthesis, platform } = fixture();
    expect(controller.state).toEqual({ supported: true, listening: false, error: null });
    expect(synthesis.speak).not.toHaveBeenCalled();
    expect(platform.createUtterance).not.toHaveBeenCalled();
    controller.start(null);
    expect(synthesis.speak).not.toHaveBeenCalled();
  });
  it('prefers local English voices and requests English when voices are not yet available', () => {
    const remote = voice('en-US', false, true);
    const local = voice('en_GB', true);
    const { controller, synthesis, utterances } = fixture([voice('cs-CZ', true, true), remote, local]);
    controller.start(result);
    expect(synthesis.speak).toHaveBeenCalledTimes(1);
    expect(utterances[0].voice).toBe(local);
    expect(utterances[0].lang).toBe('en');
    expect(controller.state.listening).toBe(true);
    const empty = fixture();
    empty.controller.start(result);
    expect(empty.utterances[0].lang).toBe('en');
    expect(empty.utterances[0].voice).toBeUndefined();
  });
  it('uses an available remote English voice when no local English voice exists', () => {
    const english = voice('en-US', false);
    const { controller, utterances } = fixture([voice('de-DE', true), english]);
    controller.start(result);
    expect(utterances[0].voice).toBe(english);
  });
  it('stops immediately and ignores late native events', () => {
    const { controller, synthesis, utterances } = fixture();
    controller.start(result);
    const lateStart = utterances[0].onstart;
    const lateError = utterances[0].onerror;
    controller.stop();
    expect(synthesis.cancel).toHaveBeenCalledTimes(2);
    lateStart?.call(utterances[0], event);
    lateError?.call(utterances[0], errorEvent);
    expect(controller.state).toEqual({ supported: true, listening: false, error: null });
  });
  it('replacing a result cancels prior speech; its late end cannot stop the new result', () => {
    const { controller, utterances, synthesis } = fixture();
    controller.start(result);
    const lateEnd = utterances[0].onend;
    controller.start({ ...result, headline_key: 'review_required', status: 'review', evidence: [] });
    expect(synthesis.cancel).toHaveBeenCalledTimes(2);
    lateEnd?.call(utterances[0], event);
    expect(controller.state.listening).toBe(true);
    utterances[1].onend?.call(utterances[1], event);
    expect(controller.state.listening).toBe(false);
  });
  it('disposal cancels, detaches callbacks and prevents further speech or state notifications', () => {
    const { controller, synthesis, utterances, states } = fixture();
    controller.start(result);
    const lateEnd = utterances[0].onend;
    const before = states.length;
    controller.dispose();
    controller.start(result);
    controller.stop();
    lateEnd?.call(utterances[0], event);
    expect(synthesis.cancel).toHaveBeenCalledTimes(2);
    expect(synthesis.speak).toHaveBeenCalledTimes(1);
    expect(utterances[0].onend).toBeNull();
    expect(states).toHaveLength(before);
    expect(controller.state.listening).toBe(false);
  });
  it('fails gracefully when speech is unsupported', () => {
    const controller = createReadAloudController(null);
    controller.start(result);
    expect(controller.state).toEqual({ supported: false, listening: false, error: 'unsupported' });
  });
  it('reports native failures without exposing the platform error or private response values', () => {
    const { controller, utterances, synthesis } = fixture();
    synthesis.speak.mockImplementationOnce(() => { throw new Error('PRIVATE_NATIVE_ERROR_123456'); });
    expect(() => controller.start(result)).not.toThrow();
    expect(controller.state).toEqual({ supported: true, listening: false, error: 'unavailable' });
    controller.start(result);
    utterances[1].onerror?.call(utterances[1], errorEvent);
    expect(controller.state).toEqual({ supported: true, listening: false, error: 'unavailable' });
  });
  it('does not queue new speech if cancelling a previous utterance fails', () => {
    const { controller, synthesis } = fixture();
    synthesis.cancel.mockImplementationOnce(() => { throw new Error('PRIVATE_CANCEL_ERROR'); });
    controller.start(result);
    expect(synthesis.speak).not.toHaveBeenCalled();
    expect(controller.state.error).toBe('unavailable');
  });
});
