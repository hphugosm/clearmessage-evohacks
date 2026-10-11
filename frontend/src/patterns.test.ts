import { describe, expect, it } from 'vitest';
import type { AnalyzeResponse } from './api';
import { possiblePattern } from './patterns';
type Evidence = AnalyzeResponse['evidence'][number];
function observed(text: string, phrase: string, key: Evidence['key'] = 'payment_pressure'): Evidence {
  const start = Array.from(text.slice(0, text.indexOf(phrase))).length;
  return { key, basis: 'observed_text_signal', span: { start, end: start + Array.from(phrase).length } };
}

describe('cautious existing-evidence pattern context', () => {
  it('explains a delivery payment request with proven observed evidence', () => {
    const text = 'Your delivery is waiting. Pay the invoice immediately to release your parcel. Visit https://example.invalid/delivery.';
    expect(possiblePattern(text, [observed(text, 'Pay the invoice immediately')])).toBe('delivery_payment');
  });
  it('uses exact Unicode offsets and adjacent multiline delivery context', () => {
    const text = '😀 Your parcel is waiting.\nPay immediately.';
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBe('delivery_payment');
  });
  it('explains an account-related secret request without changing its result', () => {
    const text = 'Your account needs verification. Send me your login code.';
    const evidence = [observed(text, 'Send me your login code', 'request_for_secret')];
    const snapshot = JSON.stringify(evidence);
    expect(possiblePattern(text, evidence)).toBe('account_secret');
    expect(JSON.stringify(evidence)).toBe(snapshot);
  });
  it('can explain bank payment context supported by the payment rule', () => {
    const text = 'Your bank account requires a payment. Pay immediately.';
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBe('bank_payment');
  });
  it('returns at most one primary context when multiple contexts are present', () => {
    const text = 'Your delivery needs payment from your bank account. Pay immediately.';
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBe('delivery_payment');
  });
  it('abstains without evidence, for classifier-only evidence and absent offsets', () => {
    const text = 'Your delivery is waiting. Pay immediately.';
    expect(possiblePattern(text, [])).toBeNull();
    expect(possiblePattern(text, [{ key: 'model_signal', basis: 'classifier' }])).toBeNull();
    expect(possiblePattern(text, [{ key: 'payment_pressure', basis: 'observed_text_signal' }])).toBeNull();
  });
  it.each([{ start: -1, end: 5 }, { start: 0, end: 2001 }, { start: 1.5, end: 3 }, { start: 4, end: 4 }])('declines invalid evidence offsets %s', span => {
    expect(possiblePattern('Your delivery. Pay immediately.', [{ key: 'payment_pressure', basis: 'observed_text_signal', span }])).toBeNull();
  });
  it.each(['This is not a delivery.', 'There is no delivery.', 'Your bank will never ask for payment.', 'Beware of a delivery scam example.', 'If your delivery needs payment, ask someone.', 'Is this your delivery?'])('does not force a pattern from negated or educational context: %s', context => {
    const text = `${context} Pay immediately.`;
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBeNull();
  });
  it('does not assign an ordinary or unrelated observed request to a pattern', () => {
    const ordinary = 'Your delivery will arrive on Tuesday.';
    expect(possiblePattern(ordinary, [])).toBeNull();
    const unrelated = 'Please pay the invoice immediately for lunch.';
    expect(possiblePattern(unrelated, [observed(unrelated, 'pay the invoice immediately')])).toBeNull();
    const secrecy = 'Your delivery is waiting. Keep this secret.';
    expect(possiblePattern(secrecy, [observed(secrecy, 'Keep this secret', 'secrecy_request')])).toBeNull();
  });
  it('ignores unrelated context more than one sentence away', () => {
    const text = 'Your delivery will arrive tomorrow. Dinner is at six. Pay immediately.';
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBeNull();
  });
  it('does not interpret URL-only words as a delivery scenario', () => {
    const text = 'https://example.invalid/delivery Pay immediately.';
    expect(possiblePattern(text, [observed(text, 'Pay immediately')])).toBeNull();
  });
});
