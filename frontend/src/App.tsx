import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { analyze, AnalysisError, MAX_TEXT_LENGTH, textLength, validateText } from './api';
import type { AnalyzeResponse, ClientErrorKey, MessageLanguage } from './api';
import { copy as t } from './copy';
import mark from '../../assets/brand/mark.svg';
import HelpRequest from './HelpRequest';

export default function App() {
  const [messageLanguage, setMessageLanguage] = useState<MessageLanguage>('auto');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [helpPreview, setHelpPreview] = useState(false);
  const [error, setError] = useState<ClientErrorKey | null>(null);
  const textField = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);
  useEffect(() => () => { requestId.current++; activeRequest.current?.abort(); }, []);

  function clearPrevious() {
    requestId.current++;
    activeRequest.current?.abort();
    activeRequest.current = null;
    setPending(false);
    setResult(null);
    setHelpPreview(false);
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setResult(null);
    setHelpPreview(false);
    const invalid = validateText(text);
    setError(invalid);
    if (invalid) { textField.current?.focus(); return; }
    const id = ++requestId.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(true);
    try {
      const response = await analyze({ text, message_language: messageLanguage }, controller.signal);
      if (id === requestId.current) setResult(response);
    } catch (caught) {
      if (id === requestId.current) setError(caught instanceof AnalysisError ? caught.key : 'unavailable');
    } finally {
      if (id === requestId.current) { setPending(false); activeRequest.current = null; }
    }
  }

  const resultLabel = result ? (result.status === 'review' && result.limitations.some(key => key === 'model_not_ready' || key === 'inference_unavailable') ? t.notPerformed : t.statusLabels[result.status]) : '';

  return (
    <div className="page">
      <header>
        <a className="brand" href="/"><img src={mark} width="32" height="32" alt="" aria-hidden="true" />ClearMessage</a>
        <nav aria-label="Main navigation"><a href="/" aria-current="page">Home</a></nav>
      </header>
      <main className="hero">
        <div className="interaction">
          <p className="prototype-label">{t.prototypeLabel}</p>
          <h1>Not sure about a message?</h1>
          <p className="intro">{t.intro}</p>
          <p className="stage">{t.stage}</p>
          <form onSubmit={submit} noValidate aria-busy={pending}>
            <label htmlFor="message">{t.textLabel}</label>
            <textarea id="message" ref={textField} value={text} rows={7} placeholder={t.placeholder}
              autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off"
              aria-invalid={error === 'empty' || error === 'too_long' || error === 'invalid_input'}
              aria-describedby={`privacy text-limit${error ? ' form-error' : ''}`}
              onChange={event => { setText(event.target.value); clearPrevious(); }} />
            <div className="field-note"><p id="text-limit">{t.limit}</p><span className={textLength(text) > MAX_TEXT_LENGTH ? 'over-limit' : ''}>{textLength(text)} / {MAX_TEXT_LENGTH}</span></div>
            <label htmlFor="message-language">{t.languageLabel}</label>
            <select id="message-language" aria-describedby="language-hint" value={messageLanguage}
              onChange={event => { setMessageLanguage(event.target.value as MessageLanguage); clearPrevious(); }}>
              {Object.entries(t.languages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <p id="language-hint" className="language-hint">{t.languageHint}</p>
            <p id="privacy" className="privacy">{t.privacy}</p>
            {error && <p id="form-error" className="error" role="alert">{t.errors[error]}</p>}
            <button className="submit" disabled={pending} type="submit">{pending ? t.pending : t.submit}
              {!pending && <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          </form>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{pending ? t.pending : result ? `${resultLabel}. ${result.analysis_complete ? t.complete : t.incomplete}` : ''}</p>
          <div>
            {result && <section className="result" data-status={result.status} aria-labelledby="result-heading">
              <p className="result-label"><svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none">
                {result.status === 'no_strong_signals' ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : <><path d="m12 3 10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 9v5m0 3v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
              </svg>{resultLabel}</p>
              <p className="completion-label">{result.analysis_complete ? t.complete : t.incomplete}</p>
              <h2 id="result-heading" tabIndex={-1} ref={resultHeading}>{t.headlines[result.headline_key]}</h2>
              <p>{t.resultDetail}</p>
              <h3>{t.reasons}</h3>
              {result.evidence.length ? <ul>{result.evidence.map(item => <li key={item.key}>{t.evidence[item.key]}</li>)}</ul> : <p>{t.noEvidence}</p>}
              <h3>{t.steps}</h3>
              <ol>{result.action_keys.map(key => <li key={key}>{t.actions[key]}</li>)}</ol>
              <h3>{t.limitationsLabel}</h3>
              <ul>{result.limitations.map(key => <li key={key}>{t.limitations[key]}</li>)}</ul>
              <button type="button" className="help-button" aria-expanded={helpPreview} aria-controls="help-preview" onClick={() => setHelpPreview(value => !value)}>{t.help}</button>
              {helpPreview && <HelpRequest summaryKeys={result.share_summary_keys} />}
            </section>}
          </div>
          <details className="clicked-advice">
            <summary>{t.clicked}</summary>
            <ol>{t.clickedAdvice.map(advice => <li key={advice}>{advice}</li>)}</ol>
          </details>
        </div>
      </main>
      <footer>{t.footer}</footer>
    </div>
  );
}
