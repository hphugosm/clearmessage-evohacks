import { describe, expect, it } from 'vitest';
import { buildHelpDraft } from './help';
import type { AnalyzeResponse } from './api';

const keys: AnalyzeResponse['share_summary_keys'] = ['analysis_not_completed', 'help_verify_independently'];
describe('neutral help templates', () => {
  it.each(['cs', 'en'] as const)('contains fixed text only in %s', language => {
    const draft = buildHelpDraft(keys, language);
    expect(draft).not.toMatch(/https?:|\.invalid|654321|PRIVATE_CANARY|password|heslo/);
    expect(draft).toContain(language === 'cs' ? 'známou nezávislou cestou' : 'familiar independent channel');
    expect(buildHelpDraft([...keys, ...keys], language)).toBe(draft);
  });
  it('rejects injected private content as keys instead of reflecting it', () => {
    const hostile = ['PRIVATE_CANARY_654321'] as unknown as AnalyzeResponse['share_summary_keys'];
    expect(() => buildHelpDraft(hostile, 'cs')).toThrow(/^invalid_share_keys$/);
  });
});
