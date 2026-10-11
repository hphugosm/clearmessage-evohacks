import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { analyze, AnalysisError, MAX_TEXT_LENGTH, textLength, validateText } from './api';
import type { AnalyzeResponse, ClientErrorKey, MessageLanguage } from './api';
import { copy as t } from './copy';
import mark from '../../assets/brand/mark.svg';
import HelpRequest from './HelpRequest';
import SafeScan from './SafeScan';
import EvidenceDetails from './EvidenceDetails';
import ActionGuide from './ActionGuide';

const OCR_ENABLED = import.meta.env.VITE_ENABLE_OCR !== 'false';

export default function App() {
  const [messageLanguage, setMessageLanguage] = useState<MessageLanguage>('auto');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'paste' | 'screenshot'>('paste');
  const [ocrReady, setOcrReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');
  const [guideRevision, setGuideRevision] = useState(0);
  const [helpPreview, setHelpPreview] = useState(false);
  const [error, setError] = useState<ClientErrorKey | null>(null);
  const textField = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => { if (ocrReady) textField.current?.focus(); }, [ocrReady]);
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);
  useEffect(() => () => { requestId.current++; activeRequest.current?.abort(); }, []);

  function clearPrevious() {
    requestId.current++;
    activeRequest.current?.abort();
    activeRequest.current = null;
    setPending(false);
    setResult(null);
    setAnalyzedText('');
    setGuideRevision(value => value + 1);
    setHelpPreview(false);
    setError(null);
    setConfirmationError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setResult(null);
    setHelpPreview(false);
    const invalid = validateText(text);
    setError(invalid);
    if (invalid) { textField.current?.focus(); return; }
    if (mode === 'screenshot' && (!ocrReady || !confirmed)) { setConfirmationError(true); document.getElementById('confirm-text')?.focus(); return; }
    const id = ++requestId.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(true);
    try {
      const response = await analyze({ text, message_language: messageLanguage }, controller.signal);
      if (id === requestId.current) { setAnalyzedText(text); setResult(response); }
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
        <nav aria-label="Main navigation"><a href="/" aria-current="page">{t.home}</a></nav>
      </header>
      <main className="hero">
        <div className="interaction">
          <p className="prototype-label">{t.prototypeLabel}</p>
          <h1>{t.hero}</h1>
          <p className="intro">{OCR_ENABLED ? t.intro : "Paste a message. We'll help you understand the warning signs and what you can do next."}</p>
          <p className="stage">{t.stage}</p>
          <form onSubmit={submit} noValidate aria-busy={pending}>
            {OCR_ENABLED && <div className="input-method" role="group" aria-label={t.inputMethod}>
              <button type="button" aria-pressed={mode === 'paste'} onClick={() => { if (mode !== 'paste') { clearPrevious(); setMode('paste'); setConfirmed(false); } }}>{t.paste}</button>
              <button type="button" aria-pressed={mode === 'screenshot'} onClick={() => { if (mode !== 'screenshot') { clearPrevious(); setMode('screenshot'); setOcrReady(false); setConfirmed(false); setText(''); } }}>{t.screenshot}</button>
            </div>}
            {mode === 'screenshot' && <SafeScan onText={value => { setText(value); setConfirmed(false); clearPrevious(); }} onReady={setOcrReady} onPaste={() => { clearPrevious(); setMode('paste'); setConfirmed(false); }} />}
            {(mode === 'paste' || ocrReady) && <>
            <label htmlFor="message">{mode === 'screenshot' ? t.scan.review : t.textLabel}</label>
            {mode === 'screenshot' && <p id="ocr-instruction" className="small">{t.scan.instruction}</p>}
            <textarea id="message" ref={textField} value={text} rows={7} placeholder={t.placeholder}
              autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off"
              aria-invalid={error === 'empty' || error === 'too_long' || error === 'invalid_input'}
              aria-describedby={`privacy text-limit${mode === 'screenshot' ? ' ocr-instruction' : ''}${error ? ' form-error' : ''}`}
              onChange={event => { setText(event.target.value); setConfirmed(false); clearPrevious(); }} />
            <div className="field-note"><p id="text-limit">{t.limit}</p><span className={textLength(text) > MAX_TEXT_LENGTH ? 'over-limit' : ''}>{textLength(text)} / {MAX_TEXT_LENGTH}</span></div>
            {mode === 'screenshot' && <label className="check-row" htmlFor="confirm-text"><input id="confirm-text" type="checkbox" checked={confirmed} aria-describedby={confirmationError ? 'confirmation-error' : undefined} onChange={event => { setConfirmed(event.target.checked); clearPrevious(); }} /><span>{t.scan.confirm}</span></label>}
            {confirmationError && <p id="confirmation-error" className="error" role="alert">{t.scan.confirmationError}</p>}
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
            </>}
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
              {result.evidence.length ? <EvidenceDetails evidence={result.evidence} analyzedText={analyzedText} /> : <p>{t.noEvidence}</p>}
              <h3>{t.steps}</h3>
              <ol>{result.action_keys.map(key => <li key={key}>{t.actions[key]}</li>)}</ol>
              <h3>{t.limitationsLabel}</h3>
              <ul>{result.limitations.map(key => <li key={key}>{t.limitations[key]}</li>)}</ul>
              <button type="button" className="help-button" aria-expanded={helpPreview} aria-controls="help-preview" onClick={() => setHelpPreview(value => !value)}>{t.help}</button>
              {helpPreview && <HelpRequest summaryKeys={result.share_summary_keys} />}
            </section>}
          </div>
          <ActionGuide key={guideRevision} />
        </div>
      </main>
      <footer>{t.footer}</footer>
    </div>
  );
}
