import type { AnalyzeResponse } from './api';
import { copy as t } from './copy';
import { evidenceExcerpt } from './evidence';

type Props = { evidence: AnalyzeResponse['evidence']; analyzedText: string };
export default function EvidenceDetails({ evidence, analyzedText }: Props) {
  return <div className="evidence-list">
    <p className="small">{t.evidenceIntro}</p>
    {evidence.map(item => {
      const excerpt = evidenceExcerpt(item, analyzedText);
      return <details className="evidence-item" key={item.key}>
        <summary>{t.evidenceTitles[item.key]}</summary>
        <p>{t.evidence[item.key]}</p>
        {excerpt !== null && <blockquote className="evidence-quote"><mark>{excerpt}</mark></blockquote>}
        <p className="small">{item.basis === 'classifier' ? t.modelEvidenceLimit : t.observedEvidenceLimit}</p>
      </details>;
    })}
  </div>;
}
