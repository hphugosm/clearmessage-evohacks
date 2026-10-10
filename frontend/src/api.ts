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
  // This foundation only accepts the real unavailable-model contract. New model
  // policy must deliberately update this gate; unknown responses cannot reassure.
  if (typeof data !== 'object' || data === null) throw new AnalysisError('unavailable');
  const value = data as Record<string, unknown>;
  const keysMatch = (items: unknown, allowed: readonly string[], min: number, max: number) =>
    Array.isArray(items) && items.length >= min && items.length <= max && items.every(item => typeof item === 'string' && allowed.includes(item));
  if (
    value.status !== 'review' || value.analysis_complete !== false ||
    value.headline_key !== 'model_not_ready' || value.model_version !== null ||
    value.contract_version !== '1.0.0' || value.policy_version !== 'foundation-1' ||
    !Array.isArray(value.evidence) || value.evidence.length !== 0 ||
    !['auto', 'cs', 'en', 'other'].includes(String(value.message_language)) ||
    !keysMatch(value.action_keys, ['verify_independently', 'do_not_send_secrets', 'ask_trusted_person'], 1, 3) ||
    !keysMatch(value.limitations, ['model_not_ready', 'language_not_evaluated', 'not_a_safety_confirmation'], 3, 3) ||
    !Array.isArray(value.limitations) || !value.limitations.includes('model_not_ready') ||
    !value.limitations.includes('language_not_evaluated') || !value.limitations.includes('not_a_safety_confirmation') ||
    !keysMatch(value.share_summary_keys, ['analysis_not_completed', 'help_verify_independently'], 0, 2)
  ) throw new AnalysisError('unavailable');
  return data as AnalyzeResponse;
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
