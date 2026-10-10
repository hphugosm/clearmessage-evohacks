import type { AnalyzeResponse } from './api';

const templates = {
  analysis_not_completed: 'The automated check was limited and does not establish message safety.',
  help_verify_independently: 'I received a message I need to verify. Could you please help me check its claims through a familiar independent channel? I do not want to use the contact or link from the message.',
};

// Only fixed allowlisted sentences. This function never takes source text,
// evidence, URLs, sender details or classifier scores.
export function buildHelpDraft(keys: AnalyzeResponse['share_summary_keys']): string {
  if (keys.some(key => key !== 'analysis_not_completed' && key !== 'help_verify_independently')) {
    throw new Error('invalid_share_keys');
  }
  return [...new Set(keys)].map(key => templates[key]).join('\n\n');
}
