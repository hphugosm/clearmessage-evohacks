import type { components } from './api.schema';

export type AnalyzeRequest = components['schemas']['AnalyzeRequest'];
export type AnalyzeResponse = components['schemas']['AnalyzeResponse'];
export type MessageLanguage = NonNullable<AnalyzeRequest['message_language']>;
export const MAX_TEXT_LENGTH = 2000;
export const textLength = (text: string) => Array.from(text).length;

export type ClientErrorKey = 'empty' | 'too_long' | 'invalid_input' | 'unavailable';
export class AnalysisError extends Error {
  constructor(public readonly key: ClientErrorKey) {
    super(key); // Never attach source text, raw response or transport exceptions.
  }
}

export function validateText(text: string): ClientErrorKey | null {
  if (!text.trim()) return 'empty';
  return textLength(text) > MAX_TEXT_LENGTH ? 'too_long' : null;
}

export function parseResponse(data: unknown): AnalyzeResponse {
  if (typeof data !== 'object' || data === null) throw new AnalysisError('unavailable');
  const value = data as Record<string, unknown>;
  const keysMatch = (items: unknown, allowed: readonly string[], min: number, max: number) =>
    Array.isArray(items) && items.length >= min && items.length <= max &&
    new Set(items).size === items.length && items.every(item => typeof item === 'string' && allowed.includes(item));
  const keys = ['status', 'analysis_complete', 'headline_key', 'evidence', 'action_keys', 'limitations', 'message_language', 'model_version', 'policy_version', 'contract_version', 'share_summary_keys'];
  const limitations = ['model_not_ready', 'language_not_evaluated', 'not_a_safety_confirmation', 'inference_unavailable', 'incomplete_coverage', 'human_review_incomplete', 'rules_only', 'insufficient_text', 'language_unspecified', 'policy_not_validated'];
  const evidenceKeys = ['model_signal', 'request_for_secret', 'payment_pressure', 'secrecy_request'];
  if (
    Object.keys(value).length !== keys.length || Object.keys(value).some(key => !keys.includes(key)) ||
    !['review', 'suspicious', 'no_strong_signals'].includes(String(value.status)) ||
    typeof value.analysis_complete !== 'boolean' ||
    value.contract_version !== '1.1.0' || value.policy_version !== 'analysis-policy-2' ||
    !(value.model_version === null || (typeof value.model_version === 'string' && value.model_version.trim().length > 0)) ||
    !['auto', 'cs', 'en', 'other'].includes(String(value.message_language)) ||
    !keysMatch(value.action_keys, ['verify_independently', 'do_not_send_secrets', 'pause_payment', 'ask_trusted_person'], 1, 3) ||
    !keysMatch(value.limitations, limitations, 1, limitations.length) ||
    !Array.isArray(value.limitations) || !value.limitations.includes('not_a_safety_confirmation') ||
    !keysMatch(value.share_summary_keys, ['analysis_not_completed', 'help_verify_independently'], 0, 2) ||
    !Array.isArray(value.evidence) || value.evidence.length > 3 ||
    value.evidence.some(item => typeof item !== 'object' || item === null || Object.keys(item).length !== 2 ||
      !evidenceKeys.includes(item.key) || item.basis !== (item.key === 'model_signal' ? 'classifier' : 'observed_text_signal')) ||
    new Set(value.evidence.map(item => item.key)).size !== value.evidence.length
  ) throw new AnalysisError('unavailable');
  const result = data as AnalyzeResponse;
  const expectedHeadline = result.status === 'review' && result.limitations.includes('model_not_ready') ? 'model_not_ready' :
    ({ review: 'review_required', suspicious: 'suspicious_signals', no_strong_signals: 'no_strong_signals' } as const)[result.status];
  if (result.headline_key !== expectedHeadline ||
    (result.analysis_complete && (!result.model_version || result.limitations.some(key => key !== 'not_a_safety_confirmation'))) ||
    (result.status === 'no_strong_signals' && (!result.analysis_complete || result.evidence.length !== 0)) ||
    ((result.status === 'suspicious') !== (result.evidence.length > 0)) ||
    (result.analysis_complete === result.share_summary_keys.includes('analysis_not_completed')) ||
    (result.evidence.some(item => item.basis === 'classifier') && (result.message_language !== 'en' || !result.model_version || result.limitations.includes('inference_unavailable') || result.limitations.includes('incomplete_coverage') || result.limitations.includes('model_not_ready')))
  ) throw new AnalysisError('unavailable');
  return result;
}

export async function analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const error = validateText(request.text);
  if (error) throw new AnalysisError(error);
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new AnalysisError([413, 422].includes(response.status) ? 'invalid_input' : 'unavailable');
    return parseResponse(await response.json());
  } catch (error) {
    if (error instanceof AnalysisError) throw error;
    throw new AnalysisError('unavailable');
  }
}
