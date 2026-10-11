import type { AnalyzeResponse } from './api';
import { evidenceExcerpt } from './evidence';

export type PossiblePattern = 'delivery_payment' | 'account_secret' | 'bank_payment';
type Evidence = AnalyzeResponse['evidence'][number];

/** Context labels explain an existing observed rule; they never change the verdict. */
function contextFor(text: string, item: Evidence): string | null {
  if (evidenceExcerpt(item, text) === null || !item.span) return null;
  const points = Array.from(text);
  const before = points.slice(0, item.span.start).join('');
  const boundaries = [...before.matchAll(/[.!?;\n]+[\s.!?;]*/g)];
  const previousStart = boundaries.length > 1 ? boundaries.at(-2)!.index + boundaries.at(-2)![0].length : 0;
  const after = points.slice(item.span.end).join('');
  const nextBoundary = after.search(/[.!?;\n]/);
  // Only the request's sentence and its immediately preceding sentence are relevant.
  const context = before.slice(previousStart).slice(-240) +
    points.slice(item.span.start, item.span.end).join('') +
    after.slice(0, nextBoundary < 0 ? 140 : Math.min(nextBoundary, 140));
  // Abstain on negation, questions or educational/hypothetical context.
  if (/\b(?:no|not|never|without|isn't|aren't|don't|doesn't|cannot|can't|won't|beware|hypothetical)\b|\b(?:scam\s+(?:example|warning)|example\s+of|if\s+(?:someone|anyone|a|your|the))\b|\?/iu.test(context)) return null;
  return context;
}

/** At most one cautious, fixed-copy pattern; classifier-only evidence is insufficient. */
export function possiblePattern(text: string, evidence: AnalyzeResponse['evidence']): PossiblePattern | null {
  const payment = evidence.find(item => item.key === 'payment_pressure' && item.basis === 'observed_text_signal');
  const secret = evidence.find(item => item.key === 'request_for_secret' && item.basis === 'observed_text_signal');
  const paymentContext = payment ? contextFor(text, payment) : null;
  const secretContext = secret ? contextFor(text, secret) : null;
  if (paymentContext && /\b(?:your|the|this|a)\s+(?:parcel|package|delivery)\b|\bdelivery\s+(?:fee|charge|payment|notice|notification)\b|\b(?:parcel|package)\s+(?:delivery|fee|charge|payment)\b/iu.test(paymentContext)) return 'delivery_payment';
  if (secretContext && /\b(?:your|the|this)\s+(?:account|login)\b|\baccount\s+(?:verification|access|security)\b/iu.test(secretContext)) return 'account_secret';
  if (paymentContext && /\b(?:your|the|this|our)\s+bank\b|\bbank\s+(?:account|payment|transfer)\b/iu.test(paymentContext)) return 'bank_payment';
  return null;
}
