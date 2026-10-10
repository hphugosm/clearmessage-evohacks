import { describe, expect, it } from 'vitest';
import { buildHelpDraft } from './help';
import type { AnalyzeResponse } from './api';

const keys: AnalyzeResponse['share_summary_keys'] = ['analysis_not_completed', 'help_verify_independently'];
describe('neutral help templates', () => {
  it('contains fixed English text only', () => {
    const draft = buildHelpDraft(keys);
    expect(draft).not.toMatch(/https?:|\.invalid|654321|PRIVATE_CANARY|password|heslo/);
    expect(draft).toContain('familiar independent channel');
    expect(buildHelpDraft([...keys, ...keys])).toBe(draft);
  });
  it('offers only the requested allowlisted sentence', () => {
    expect(buildHelpDraft(['analysis_not_completed'])).toBe('The automated check was limited and does not establish message safety.');
    expect(buildHelpDraft([])).toBe('');
  });
  it('rejects injected private content as keys instead of reflecting it', () => {
    const hostile = ['PRIVATE_CANARY_654321'] as unknown as AnalyzeResponse['share_summary_keys'];
    expect(() => buildHelpDraft(hostile)).toThrow(/^invalid_share_keys$/);
  });
});
