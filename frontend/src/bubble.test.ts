import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MessageBubble from './MessageBubble';
import { bubbleSegments } from './bubble';
import type { EvidenceItem } from './bubble';

const observed = (start: number, end: number, key: 'request_for_secret' | 'payment_pressure' | 'secrecy_request' = 'request_for_secret'): EvidenceItem =>
  ({ key, basis: 'observed_text_signal', span: { start, end } });
const highlighted = (text: string, evidence: EvidenceItem[], displayed = text) =>
  bubbleSegments(text, evidence, displayed).filter(segment => segment.evidenceIndices.length > 0);
const markup = (text: string, evidence: EvidenceItem[], displayText = text) => renderToStaticMarkup(createElement(MessageBubble,
  { text, evidence, displayText, title: 'Your message', hint: 'Select a highlighted phrase for its observed reason.' }));

describe('verified interactive bubble segments', () => {
  it('preserves emoji, combining marks and multiline text with Python code-point offsets', () => {
    const text = '😀 è\nPlease send me your code.';
    const start = Array.from('😀 è\n').length;
    const segments = bubbleSegments(text, [observed(start, Array.from(text).length)]);
    expect(segments.map(segment => segment.text).join('')).toBe(text);
    expect(segments[0].text).toBe('😀 è\n');
    expect(segments[1].text).toBe('Please send me your code.');
    expect(segments[1].start).toBe(5);
  });

  it('highlights only the specified repeated occurrence', () => {
    const phrase = 'Pay the invoice immediately.';
    const text = `${phrase}\n${phrase}`;
    const start = Array.from(`${phrase}\n`).length;
    const segments = bubbleSegments(text, [observed(start, Array.from(text).length, 'payment_pressure')]);
    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe(`${phrase}\n`);
    expect(segments[0].evidenceIndices).toEqual([]);
    expect(segments[1].evidenceIndices).toEqual([0]);
  });

  it('merges overlapping and nested spans without losing either explanation', () => {
    const spans = [observed(2, 8), observed(5, 11, 'payment_pressure'), observed(3, 6, 'secrecy_request')];
    expect(highlighted('abcdefghijklmn', spans)).toEqual([{ start: 2, end: 11, text: 'cdefghijk', evidenceIndices: [0, 1, 2] }]);
  });

  it('keeps adjacent spans separate and partitions the whole original text', () => {
    const segments = bubbleSegments('abcdefghij', [observed(5, 8, 'payment_pressure'), observed(2, 5)]);
    expect(segments.map(segment => segment.text).join('')).toBe('abcdefghij');
    expect(segments.filter(segment => segment.evidenceIndices.length > 0).map(segment => segment.text)).toEqual(['cde', 'fgh']);
  });

  it.each([{ start: -1, end: 4 }, { start: 0, end: 50 }, { start: 3, end: 3 }, { start: 1.5, end: 4 }, { start: 0, end: Infinity }])
    ('declines invalid offsets rather than guessing phrases', span => {
      expect(highlighted('short', [observed(span.start, span.end)])).toEqual([]);
      expect(bubbleSegments('short', [observed(span.start, span.end)])[0].text).toBe('short');
    });

  it('does not highlight model evidence or observed evidence without a span', () => {
    const model = { key: 'model_signal', basis: 'classifier', span: { start: 0, end: 4 } } as EvidenceItem;
    const absent = { key: 'request_for_secret', basis: 'observed_text_signal' } as EvidenceItem;
    expect(highlighted('send my code', [model, absent])).toEqual([]);
    expect(markup('send my code', [model, absent])).not.toContain('message-highlight');
  });

  it('renders only masked display characters while retaining original span positions', () => {
    const text = 'Please send me PRIVATE_CANARY.';
    const displayed = `Please send me ${'•'.repeat(Array.from('PRIVATE_CANARY.').length)}`;
    const evidence = [observed(0, Array.from(text).length)];
    expect(highlighted(text, evidence, displayed)[0].text).toBe(displayed);
    const html = markup(text, evidence, displayed);
    expect(html).not.toContain('PRIVATE_CANARY');
    expect(html).toContain('aria-label="A request for a password or code"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
  });

  it('declines shifted spans when a masking replacement changes text length', () => {
    const text = 'Please send me PRIVATE_CANARY.';
    const evidence = [observed(0, Array.from(text).length)];
    expect(bubbleSegments(text, evidence, 'Hidden')).toEqual([{ start: 0, end: 6, text: 'Hidden', evidenceIndices: [] }]);
    const html = markup(text, evidence, 'Hidden');
    expect(html).not.toContain('PRIVATE_CANARY');
    expect(html).not.toContain('message-highlight');
  });

  it('escapes hostile markup and keeps a long URL inert without truncation', () => {
    const text = `<img src="https://example.invalid/" onerror="alert(1)">\nhttps://example.invalid/${'a'.repeat(1400)}`;
    const html = markup(text, [observed(0, 5)]);
    expect(html).toContain('&lt;img');
    expect(html).toContain('a'.repeat(1400));
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<a ');
    expect(html).not.toMatch(/<[a-z][^>]*\s(?:href|src|onclick)=/i);
    expect(bubbleSegments(text, []).map(segment => segment.text).join('')).toBe(text);
  });

  it('handles an empty masked view without recovering original text', () => {
    expect(bubbleSegments('PRIVATE_CANARY', [observed(0, 4)], '')).toEqual([]);
    expect(markup('PRIVATE_CANARY', [observed(0, 4)], '')).not.toContain('PRIVATE_CANARY');
  });
});
