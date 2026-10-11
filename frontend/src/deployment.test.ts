import { describe, expect, it } from 'vitest';
import { analysisUrl } from './deployment';
import { parseResponse } from './api';
import recorded from './demo/recorded-example.json';

describe('deployment boundaries', () => {
  it('uses same-origin analysis by default and an explicit HTTPS origin when configured', () => {
    expect(analysisUrl('')).toBe('/api/analyze');
    expect(analysisUrl('https://api.example.invalid')).toBe('https://api.example.invalid/api/analyze');
  });
  it('rejects HTTP, embedded credentials, paths, query strings and fragments', () => {
    for (const url of ['http://api.example.invalid', 'https://user:secret@api.example.invalid',
      'https://api.example.invalid/message', 'https://api.example.invalid?text=private',
      'https://api.example.invalid/#private', 'javascript:alert(1)']) {
      expect(() => analysisUrl(url)).toThrow();
    }
  });
  it('retains the recorded result contract, incomplete assessment and true rule offsets', () => {
    const result = parseResponse(recorded.response);
    expect(recorded.kind).toBe('recorded_real_local_analysis');
    expect(result.analysis_complete).toBe(false);
    expect(result.limitations).toContain('not_a_safety_confirmation');
    const phrase = result.evidence.find(item => item.key === 'payment_pressure')!;
    expect(Array.from(recorded.text).slice(phrase.span!.start, phrase.span!.end).join('')).toBe('Pay the invoice immediately');
    expect(result.evidence.find(item => item.key === 'model_signal')!.span).toBeNull();
  });
});
