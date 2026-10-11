import { describe, expect, it } from 'vitest';
import { automaticMaskRanges, maskText, mergeMaskRanges, rangesOverlap, selectionToCodePointRange } from './privacy';

describe('display-only privacy masks', () => {
  it('replaces common explicit details, without retaining their readable values', () => {
    const text = '😀 Email ava@example.invalid. Call +1 (202) 555-0123.\nPassword: SECRET_CANARY verification code: 654321. Visit https://example.invalid/private?token=URL_CANARY';
    const masked = maskText(text, automaticMaskRanges(text));
    for (const secret of ['ava@example.invalid', '+1 (202) 555-0123', 'SECRET_CANARY', '654321', 'https://example.invalid', 'URL_CANARY']) expect(masked).not.toContain(secret);
    expect(masked).toContain('Email');
    expect(masked).toContain('Password:');
    expect(masked).toContain('\n');
    expect(Array.from(masked)).toHaveLength(Array.from(text).length);
    expect(text).toContain('SECRET_CANARY');
  });
  it('supports quoted password values and explicit payment credentials', () => {
    const text = 'Password is "two secret words"; PIN=5931; Card number: 5555-1111-2222-3333; CVV: 901; account number: ACCOUNT_CANARY';
    const masked = maskText(text, automaticMaskRanges(text));
    for (const secret of ['two secret words', '5931', '5555-1111-2222-3333', '901', 'ACCOUNT_CANARY']) expect(masked).not.toContain(secret);
  });
  it('accepts a colon after the word is without mistaking longer words for a delimiter', () => {
    const text = 'Password is: PRIVATE_CANARY. Password island is a fictional title.';
    const masked = maskText(text, automaticMaskRanges(text));
    expect(masked).not.toContain('PRIVATE_CANARY');
    expect(masked).toContain('Password island');
  });
  it('supports numeric code labels without punctuation and Unicode email addresses', () => {
    const text = 'Login code 734921. Send to zoë@example.invalid.';
    const masked = maskText(text, automaticMaskRanges(text));
    expect(masked).not.toContain('734921');
    expect(masked).not.toContain('zoë@example.invalid');
  });
  it('masks each repeated occurrence and multiline URLs independently', () => {
    const text = 'a@example.invalid\na@example.invalid\nwww.example.invalid/one\nhttps://example.invalid/two';
    const ranges = automaticMaskRanges(text);
    expect(ranges).toHaveLength(4);
    expect(maskText(text, ranges)).not.toContain('example.invalid');
    expect(maskText(text, ranges).split('\n')).toHaveLength(4);
  });
  it('merges overlapping automatic and manual selections without mutating them', () => {
    const ranges = [{ start: 2, end: 5 }, { start: 4, end: 7 }, { start: 7, end: 9 }, { start: 0, end: 1 }];
    expect(mergeMaskRanges('0123456789', ranges)).toEqual([{ start: 0, end: 1 }, { start: 2, end: 9 }]);
    expect(maskText('0123456789', ranges)).toBe('•1•••••••9');
    expect(ranges[0]).toEqual({ start: 2, end: 5 });
  });
  it('declines invalid manual ranges instead of clamping onto another phrase', () => {
    const ranges = [{ start: -1, end: 2 }, { start: 0, end: 12 }, { start: 4, end: 4 }, { start: 1.5, end: 3 }, { start: 0, end: Number.NaN }];
    expect(mergeMaskRanges('private', ranges)).toEqual([]);
    expect(maskText('private', ranges)).toBe('private');
  });
  it('maps textarea UTF-16 offsets after emoji into code-point selections', () => {
    const text = '😀 name';
    expect(selectionToCodePointRange(text, 3, 7)).toEqual({ start: 2, end: 6 });
    expect(maskText(text, [selectionToCodePointRange(text, 3, 7)!])).toBe('😀 ••••');
  });
  it('expands selections that bisect an emoji and preserves combining characters', () => {
    expect(selectionToCodePointRange('😀a', 1, 2)).toEqual({ start: 0, end: 1 });
    expect(selectionToCodePointRange('a😀b', 1, 2)).toEqual({ start: 1, end: 2 });
    expect(maskText('e\u0300😀', [{ start: 0, end: 2 }])).toBe('••😀');
  });
  it.each([[0, 0], [-1, 2], [0, 20], [2, 1], [0.5, 2], [0, Number.NaN]])('rejects invalid UTF-16 selections %s to %s', (start, end) => {
    expect(selectionToCodePointRange('text', start, end)).toBeNull();
  });
  it('requires manual selection for names and ambiguous private details', () => {
    const text = 'My name is Alex. Meet at noon.';
    expect(automaticMaskRanges(text)).toEqual([]);
    expect(maskText(text, [{ start: 11, end: 15 }])).toBe('My name is ••••. Meet at noon.');
  });
  it('keeps HTML-like source as inert text and masks URLs without parsing it', () => {
    const text = '<img src="https://example.invalid/SECRET_CANARY">';
    expect(maskText(text, automaticMaskRanges(text))).toContain('<img src="');
    expect(maskText(text, automaticMaskRanges(text))).not.toContain('SECRET_CANARY');
  });
  it('uses strict overlap checks so adjacent evidence can still display normally', () => {
    expect(rangesOverlap({ start: 1, end: 4 }, { start: 3, end: 5 })).toBe(true);
    expect(rangesOverlap({ start: 1, end: 4 }, { start: 4, end: 5 })).toBe(false);
  });
});
