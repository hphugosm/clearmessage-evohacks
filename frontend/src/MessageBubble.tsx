import { useEffect, useId, useState } from 'react';
import { bubbleSegments } from './bubble';
import type { EvidenceItem } from './bubble';
import { copy as t } from './copy';

type Props = {
  text: string;
  evidence: readonly EvidenceItem[];
  /** Optional masking must preserve the original number of Unicode code points. */
  displayText?: string;
  title: string;
  hint: string;
};

export default function MessageBubble({ text, evidence, displayText = text, title, hint }: Props) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const segments = bubbleSegments(text, evidence, displayText);
  const reasonId = (index: number) => `${id}-reason-${index}`;
  const label = (indices: number[]) => indices.map(index => t.evidenceTitles[evidence[index].key]).join(', ');
  useEffect(() => setSelected(null), [text, evidence]);

  return <section className="message-bubble" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{title}</h3>
    <p className="small">{hint}</p>
    <p className="message-bubble-text">{segments.map((segment, index) => segment.evidenceIndices.length > 0
      ? <button type="button" className="message-highlight" key={`${segment.start}-${segment.end}`}
        aria-label={label(segment.evidenceIndices)} aria-expanded={selected === index}
        aria-controls={reasonId(index)} aria-describedby={selected === index ? reasonId(index) : undefined}
        onClick={() => setSelected(current => current === index ? null : index)}>{segment.text}</button>
      : <span key={`${segment.start}-${segment.end}`}>{segment.text}</span>)}</p>
    <div className="bubble-explanations">{segments.map((segment, index) => segment.evidenceIndices.length > 0
      ? <div className="bubble-explanation" id={reasonId(index)} key={index} role="region"
        aria-label={label(segment.evidenceIndices)} hidden={selected !== index}>
        {segment.evidenceIndices.map(evidenceIndex => <p key={evidenceIndex}>{t.evidence[evidence[evidenceIndex].key]}</p>)}
        <p className="small">{t.observedEvidenceLimit}</p>
      </div>
      : null)}</div>
  </section>;
}
