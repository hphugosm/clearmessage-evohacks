import type { KeyboardEvent } from 'react';
import facts from './model-facts.json';
import { copy as t } from './copy';

function scrollTable(event: KeyboardEvent<HTMLDivElement>) {
  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
  const region = event.currentTarget;
  if (!direction || region.scrollWidth <= region.clientWidth) return;
  // WebKit does not natively scroll a focused horizontal region with arrows.
  event.preventDefault();
  region.scrollBy({ left: direction * 64, behavior: 'auto' });
}

export default function BehindAI() {
  const b = t.behindAI;
  return <main className="hero transparency">
    <p className="prototype-label">{t.prototypeLabel}</p>
    <h1>{b.title}</h1>
    <p className="intro">{b.intro}</p>
    <section aria-labelledby="pipeline-title">
      <h2 id="pipeline-title">{b.pipelineTitle}</h2>
      <ol className="pipeline">{b.pipeline.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="small">{b.pipelineNotice}</p>
    </section>
    <section aria-labelledby="model-title">
      <h2 id="model-title">{b.modelTitle}</h2>
      <p>{b.modelDescription}</p>
      <dl className="class-definitions">{Object.entries(b.classes).map(([label, description]) => <div key={label}><dt>{label.toUpperCase()}</dt><dd>{description}</dd></div>)}</dl>
      <p>{b.training}</p>
      <p className="small">{b.comparison}</p>
    </section>
    <section aria-labelledby="dataset-title">
      <h2 id="dataset-title">{b.datasetTitle}</h2>
      <p><strong>{facts.datasetCount.toLocaleString('en-US')}</strong> {b.datasetMessages}</p>
      <ul>{(['ham','spam','smishing'] as const).map(label => <li key={label}>{facts.classCounts[label].toLocaleString('en-US')} {label.toUpperCase()}</li>)}</ul>
      <p className="small">{b.datasetLimit}</p>
      <p className="small"><a href="https://data.mendeley.com/datasets/f45bkkt8pr/1" rel="noreferrer">{b.datasetCredit}</a>{b.datasetLicense}</p>
    </section>
    <section aria-labelledby="metrics-title">
      <h2 id="metrics-title">{b.metricsTitle}</h2>
      <p>{b.metricsMeaning}</p>
      <dl className="metrics">
        <div><dt>{b.macroF1}</dt><dd>{facts.macroF1.toFixed(3)}</dd></div>
        <div><dt>{b.smishingRecall}</dt><dd>{facts.perClass.smishing.recall.toFixed(3)}</dd></div>
      </dl>
      <p>{facts.smishingCorrect} {b.correctOf} {facts.perClass.smishing.support} {b.smishingExamples} {facts.perClass.smishing.false_negatives} {b.missed}</p>
      <p className="disclosure">{b.disclosure}</p>
      <p>{b.languageLimit}</p>
      <details className="metrics-details"><summary>{b.detailedMetrics}</summary>
        <p className="small">{b.testCount} {facts.testCount}. {b.metricFormat}</p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={b.classMetrics} onKeyDown={scrollTable}><table>
          <caption>{b.classMetrics}</caption>
          <thead><tr>{b.metricColumns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
          <tbody>{(['ham','spam','smishing'] as const).map(label => {
            const values=facts.perClass[label];
            return <tr key={label}><th scope="row">{label.toUpperCase()}</th><td>{values.precision.toFixed(3)}</td><td>{values.recall.toFixed(3)}</td><td>{values['f1-score'].toFixed(3)}</td><td>{values.support}</td><td>{values.false_positives}</td><td>{values.false_negatives}</td></tr>;
          })}</tbody>
        </table></div>
        <p className="small">{b.confusionExplanation}</p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={b.confusionTitle} onKeyDown={scrollTable}><table><caption>{b.confusionTitle}</caption><thead><tr><th scope="col">{b.sourceClass}</th>{['HAM','SPAM','SMISHING'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{facts.confusionMatrix.map((row,index)=><tr key={index}><th scope="row">{['HAM','SPAM','SMISHING'][index]}</th>{row.map((value,column)=><td key={column}>{value}</td>)}</tr>)}</tbody></table></div>
      </details>
    </section>
    <section aria-labelledby="limits-title"><h2 id="limits-title">{b.limitsTitle}</h2><p>{b.limits}</p><p>{b.releaseLimit}</p></section>
    <section aria-labelledby="privacy-title"><h2 id="privacy-title">{b.privacyTitle}</h2>{b.privacy.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>
    <section aria-labelledby="technology-title"><h2 id="technology-title">{b.technologyTitle}</h2><p>{b.technology}</p><p className="small">{b.credits} <a href="https://github.com/naptha/tesseract.js/tree/v6.0.1" rel="noreferrer">Tesseract.js</a>.</p></section>
    <a className="back-link" href="/">{b.back}</a>
  </main>;
}
