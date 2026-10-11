import type { AnalyzeResponse } from './api';

import { copy } from './copy';

// Only fixed allowlisted sentences. This function never takes source text,
// evidence, URLs, sender details or classifier scores.
export function buildHelpDraft(keys: AnalyzeResponse['share_summary_keys']): string {
  if (keys.some(key => key !== 'analysis_not_completed' && key !== 'help_verify_independently')) {
    throw new Error('invalid_share_keys');
  }
  return [...new Set(keys)].map(key => copy.helpTemplates[key]).join('\n\n');
}
