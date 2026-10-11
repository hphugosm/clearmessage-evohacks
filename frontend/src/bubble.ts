import type { AnalyzeResponse } from './api';
import { evidenceExcerpt } from './evidence';

export type EvidenceItem = AnalyzeResponse['evidence'][number];
export type BubbleSegment = {
  start: number;
  end: number;
  text: string;
  evidenceIndices: number[];
};

type Highlight = { start: number; end: number; evidenceIndices: number[] };
const observedKeys = new Set(['request_for_secret', 'payment_pressure', 'secrecy_request']);

/** Keep Python code-point offsets and use only spans supplied by observed rules. */
export function bubbleSegments(
  originalText: string,
  evidence: readonly EvidenceItem[],
  displayText = originalText,
): BubbleSegment[] {
  const original = Array.from(originalText);
  const displayed = Array.from(displayText);
  if (displayed.length === 0) return [];
  const plain = (): BubbleSegment[] => [{ start: 0, end: displayed.length, text: displayText, evidenceIndices: [] }];
  // A shorter replacement must never expose original text or shift an explanation.
  if (original.length !== displayed.length) return plain();

  const highlights: Highlight[] = [];
  evidence.forEach((item, index) => {
    if (!observedKeys.has(item.key) || evidenceExcerpt(item, originalText) === null || !item.span) return;
    highlights.push({ ...item.span, evidenceIndices: [index] });
  });
  highlights.sort((left, right) => left.start - right.start || left.end - right.end);

  const groups: Highlight[] = [];
  for (const highlight of highlights) {
    const previous = groups.at(-1);
    // The union of overlapping verified spans remains entirely verified. Adjacent
    // spans stay separate so they retain their distinct explanations.
    if (previous && highlight.start < previous.end) {
      previous.end = Math.max(previous.end, highlight.end);
      previous.evidenceIndices.push(...highlight.evidenceIndices);
    } else {
      groups.push({ ...highlight, evidenceIndices: [...highlight.evidenceIndices] });
    }
  }
  if (groups.length === 0) return plain();

  const segments: BubbleSegment[] = [];
  let cursor = 0;
  const add = (start: number, end: number, evidenceIndices: number[] = []) => {
    if (end > start) segments.push({ start, end, text: displayed.slice(start, end).join(''), evidenceIndices });
  };
  for (const group of groups) {
    add(cursor, group.start);
    add(group.start, group.end, [...new Set(group.evidenceIndices)].sort((left, right) => left - right));
    cursor = group.end;
  }
  add(cursor, displayed.length);
  return segments;
}
