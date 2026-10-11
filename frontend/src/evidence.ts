import type { AnalyzeResponse } from './api';

/** Python offsets count Unicode code points, rather than JavaScript UTF-16 units. */
export function evidenceExcerpt(item: AnalyzeResponse['evidence'][number], text: string): string | null {
  if (item.basis !== 'observed_text_signal' || !item.span) return null;
  const points = Array.from(text);
  const { start, end } = item.span;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > points.length) return null;
  return points.slice(start, end).join('');
}
