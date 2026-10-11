import { useState } from 'react';
import { copy as t } from './copy';
import type { Situation } from './copy';

export default function ActionGuide() {
  const [situation, setSituation] = useState<Situation>('none');
  const [checked, setChecked] = useState<number[]>([]);
  const steps = t.guide.checklists[situation];
  return <details className="action-guide">
    <summary>{t.guide.title}</summary>
    <p className="small">{t.guide.notice}</p>
    <fieldset>
      <legend>{t.guide.choose}</legend>
      {Object.entries(t.guide.situations).map(([key, label]) => <label className="check-row" key={key}>
        <input type="radio" name="situation" value={key} checked={situation === key} onChange={() => { setSituation(key as Situation); setChecked([]); }} />
        <span>{label}</span>
      </label>)}
    </fieldset>
    <h3>{t.guide.next}</h3>
    <ul className="checklist">
      {steps.map((step, index) => <li key={`${situation}-${index}`}><label className="check-row">
        <input type="checkbox" checked={checked.includes(index)} onChange={event => setChecked(previous => event.target.checked ? [...previous, index] : previous.filter(value => value !== index))} />
        <span>{step}</span>
      </label></li>)}
    </ul>
    <p className="small">{t.guide.ephemeral}</p>
  </details>;
}
