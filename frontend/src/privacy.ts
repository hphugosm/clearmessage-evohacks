/** Display-only masks use the same Unicode code-point offsets as rule evidence. */
export type MaskRange = { start: number; end: number };

function validRange(range: MaskRange, length: number): boolean {
  return Number.isInteger(range.start) && Number.isInteger(range.end) &&
    range.start >= 0 && range.end > range.start && range.end <= length;
}

/** Invalid ranges are declined, rather than silently hiding a different phrase. */
export function mergeMaskRanges(text: string, ranges: readonly MaskRange[]): MaskRange[] {
  const length = Array.from(text).length;
  const ordered = ranges.filter(range => validRange(range, length))
    .map(range => ({ ...range })).sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: MaskRange[] = [];
  for (const range of ordered) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else merged.push(range);
  }
  return merged;
}

/** Native textarea selections use UTF-16. Expand split surrogate pairs completely. */
export function selectionToCodePointRange(text: string, startUtf16: number, endUtf16: number): MaskRange | null {
  if (!Number.isInteger(startUtf16) || !Number.isInteger(endUtf16) || startUtf16 < 0 ||
    endUtf16 <= startUtf16 || endUtf16 > text.length) return null;
  let offset = 0;
  let start = -1;
  let end = 0;
  const points = Array.from(text);
  for (let index = 0; index < points.length; index++) {
    const next = offset + points[index].length;
    if (start < 0 && next > startUtf16) start = index;
    if (offset < endUtf16) end = index + 1;
    offset = next;
  }
  return start >= 0 && end > start ? { start, end } : null;
}

export function rangesOverlap(a: MaskRange, b: MaskRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Conservative recognizers for common explicit details, never a promise of complete
 * anonymization. Names and ambiguous details need a user's manual selection.
 * No value is logged, stored, rendered as HTML, fetched or passed to another API.
 */
export function automaticMaskRanges(text: string): MaskRange[] {
  const ranges: MaskRange[] = [];
  const add = (start: number, end: number) => {
    const range = selectionToCodePointRange(text, start, end);
    if (range) ranges.push(range);
  };
  const collect = (expression: RegExp) => {
    for (const match of text.matchAll(expression)) add(match.index, match.index + match[0].length);
  };
  collect(/[\p{L}\p{N}.!#$%&'*+/=?^_`{|}~-]+@[\p{L}\p{N}](?:[\p{L}\p{N}.-]*[\p{L}\p{N}])?\.[\p{L}]{2,}/gu);
  collect(/\b(?:https?:\/\/|www\.)[^\s<>]+/giu);
  for (const match of text.matchAll(/\+?\d[\d ()-]{5,}\d/g)) {
    if ((match[0].match(/\d/g)?.length ?? 0) >= 7) add(match.index, match.index + match[0].length);
  }
  const labels = '(?:password|passcode|pin|otp|verification\\s+code|login\\s+code|security\\s+code|account\\s+number|card\\s+number|cvv|cvc)';
  const explicit = new RegExp(`(\\b${labels}\\s*(?::|=|is\\b\\s*:?)\\s*)("[^"\\r\\n]+"|'[^'\\r\\n]+'|[^\\s,;]+)`, 'giu');
  for (const match of text.matchAll(explicit)) {
    const start = match.index + match[1].length;
    add(start, start + match[2].length);
  }
  const numeric = new RegExp(`(\\b${labels}\\s+)(\\d{3,16})(?!\\d)`, 'giu');
  for (const match of text.matchAll(numeric)) {
    const start = match.index + match[1].length;
    add(start, start + match[2].length);
  }
  return mergeMaskRanges(text, ranges);
}

/** One masking character per code point preserves evidence offsets exactly. */
export function maskText(text: string, ranges: readonly MaskRange[]): string {
  const points = Array.from(text);
  for (const { start, end } of mergeMaskRanges(text, ranges)) points.fill('•', start, end);
  return points.join('');
}
