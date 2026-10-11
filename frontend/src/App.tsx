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
import BehindAI from './BehindAI';
import MessageBubble from './MessageBubble';
import { useReadAloud } from './speech';
import { automaticMaskRanges, mergeMaskRanges, maskText, selectionToCodePointRange } from './privacy';
import type { MaskRange } from './privacy';
import { possiblePattern } from './patterns';
import { STATIC_DEMO, HOME_URL, BEHIND_URL } from './deployment';
import recordedExample from './demo/recorded-example.json';
import { parseResponse } from './api';

const IS_BEHIND = location.pathname === '/how-it-works' || new URLSearchParams(location.search).get('view') === 'how-it-works';
const OCR_ENABLED = !STATIC_DEMO && import.meta.env.VITE_ENABLE_OCR !== 'false';

function InputIcon({image = false}: {image?: boolean}) {
  return <svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32" fill="none">
    {image ? <><rect x="4" y="5" width="24" height="22" rx="4"/><circle cx="11" cy="12" r="2"/><path d="m5 23 7-7 5 5 4-4 6 6"/></> : <><path d="M27 15c0 6-5 10-11 10H9l-5 3V15C4 9 9 5 16 5s11 4 11 10Z"/><path d="M10 12h12m-12 6h8"/></>}
  </svg>;
}

export default function App() {
  const [messageLanguage, setMessageLanguage] = useState<MessageLanguage>('auto');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'home' | 'paste' | 'screenshot'>('home');
  const [ocrReady, setOcrReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');
  const [example, setExample] = useState(false);
  const [details, setDetails] = useState(false);
  const [guideRevision, setGuideRevision] = useState(0);
  const [helpPreview, setHelpPreview] = useState(false);
  const [shield, setShield] = useState(false);
  const [manualMasks, setManualMasks] = useState<MaskRange[]>([]);
  const [maskEditor, setMaskEditor] = useState(false);
  const [maskFeedback, setMaskFeedback] = useState('');
  const maskField = useRef<HTMLTextAreaElement>(null);
  const speech = useReadAloud(result, guideRevision);
  const [error, setError] = useState<ClientErrorKey | null>(null);
  const textField = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const homeHeading = useRef<HTMLHeadingElement>(null);
  const guide = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => { if (!result && (mode === 'paste' || ocrReady)) textField.current?.focus(); }, [mode, ocrReady, result]);
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);
  useEffect(() => () => { requestId.current++; activeRequest.current?.abort(); }, []);

  function clearPrevious() {
    speech.stop(); setShield(false); setManualMasks([]); setMaskEditor(false); setMaskFeedback('');
    requestId.current++; activeRequest.current?.abort(); activeRequest.current = null;
    setPending(false); setResult(null); setAnalyzedText(''); setDetails(false);
    setGuideRevision(value => value + 1); setHelpPreview(false); setError(null); setConfirmationError(false);
  }
  function chooseMode(next: 'home'|'paste'|'screenshot') {
    clearPrevious(); setMode(next); setExample(false); setConfirmed(false);
    if (next !== 'paste') { setText(''); setOcrReady(false); }
    if (next === 'home') requestAnimationFrame(() => homeHeading.current?.focus());
  }
  async function check(value: string, language: MessageLanguage) {
    clearPrevious();
    const invalid = validateText(value); setError(invalid);
    if (invalid) { textField.current?.focus(); return; }
    const id = ++requestId.current; const controller = new AbortController();
    activeRequest.current = controller; setPending(true);
    try {
      const response = await analyze({text: value, message_language: language}, controller.signal);
      if (id === requestId.current) { setAnalyzedText(value); setResult(response); }
    } catch (caught) {
      if (id === requestId.current) setError(caught instanceof AnalysisError ? caught.key : 'unavailable');
    } finally {
      if (id === requestId.current) { setPending(false); activeRequest.current = null; }
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const invalid = validateText(text);
    if (invalid) { clearPrevious(); setError(invalid); textField.current?.focus(); return; }
    if (mode === 'screenshot' && (!ocrReady || !confirmed)) { setConfirmationError(true); document.getElementById('confirm-text')?.focus(); return; }
    void check(text, messageLanguage);
  }
  function tryExample() {
    setMode('paste'); setText(t.experience.exampleText); setMessageLanguage('en'); setExample(true); setConfirmed(false);
    if (STATIC_DEMO) {
      clearPrevious(); setText(recordedExample.text); setAnalyzedText(recordedExample.text);
      setResult(parseResponse(recordedExample.response));
    } else void check(t.experience.exampleText, 'en');
  }
  function openGuide() {
    const disclosure = guide.current?.querySelector('details');
    if (disclosure) { disclosure.open = true; disclosure.querySelector('summary')?.focus(); }
  }
  const resultLabel = result ? (result.status === 'review' && result.limitations.some(key => key === 'model_not_ready' || key === 'inference_unavailable') ? t.notPerformed : t.statusLabels[result.status]) : '';
  const masks = mergeMaskRanges(analyzedText, [...automaticMaskRanges(analyzedText), ...manualMasks]);
  const displayText = shield ? maskText(analyzedText, masks) : analyzedText;
  const pattern = result ? possiblePattern(analyzedText, result.evidence) : null;
  function hideSelection() {
    const field = maskField.current;
    const range = field ? selectionToCodePointRange(displayText, field.selectionStart, field.selectionEnd) : null;
    if (!range) { setMaskFeedback(t.experience.privacy.noSelection); field?.focus(); return; }
    setManualMasks(previous => mergeMaskRanges(analyzedText, [...previous, range]));
    setShield(true); setMaskFeedback(t.experience.privacy.applied);
    // Restore focus to the user's selection control after masking the selected text.
    field?.focus();
  }
  const criticalKeys = result?.limitations.filter(key => !['policy_not_validated','language_unspecified','not_a_safety_confirmation'].includes(key)) ?? [];

  return <div className="page">
    <header>
      <a className="brand" href={HOME_URL} onClick={speech.stop}><img src={mark} width="32" height="32" alt="" aria-hidden="true"/>ClearMessage</a>
      <nav aria-label="Main navigation"><a onClick={speech.stop} href={IS_BEHIND ? HOME_URL : BEHIND_URL}>{IS_BEHIND ? t.home : t.experience.how}</a></nav>
    </header>
    {STATIC_DEMO && <aside className="recorded-demo" aria-label={t.experience.recordedLabel}><strong>{t.experience.recordedLabel}</strong><p>{t.experience.recordedNotice}</p></aside>}
    {IS_BEHIND ? <BehindAI/> : <main className="hero">
      {mode === 'home' ? <section className="welcome" aria-labelledby="home-heading">
        <div className="welcome-mark" aria-hidden="true"><InputIcon/><span/></div>
        <h1 id="home-heading" ref={homeHeading} tabIndex={-1}>{t.hero}</h1>
        <p className="intro">{t.experience.welcome}</p>
        {!STATIC_DEMO && <div className="home-actions">
          {OCR_ENABLED && <button className="home-choice" type="button" onClick={() => chooseMode('screenshot')}><InputIcon image/><span>{t.screenshot}</span><span aria-hidden="true">→</span></button>}
          <button className="home-choice home-choice-primary" type="button" onClick={() => chooseMode('paste')}><InputIcon/><span>{t.paste}</span><span aria-hidden="true">→</span></button>
        </div>}
        <button className="text-button demo-button" type="button" onClick={tryExample}>{t.experience.example}<span aria-hidden="true"> ↗</span></button>
      </section> : <div className="interaction">
        <div className="flow-bar"><button className="text-button" type="button" onClick={() => chooseMode('home')}><span aria-hidden="true">← </span>{t.experience.back}</button>{example && <span className="example-label">{t.experience.exampleLabel}</span>}</div>
        {result ? <>
          <section className="result" data-status={result.status} aria-labelledby="result-heading">
            <p className="result-label"><span aria-hidden="true">!</span>{resultLabel}</p>
            <h1 id="result-heading" ref={resultHeading} tabIndex={-1}>{t.headlines[result.headline_key]}</h1>
            <p className="result-summary">{result.evidence.length ? t.experience.simpleReasons[result.evidence[0].key] : t.experience.noFinding}</p>
            <p className="critical-limits">{result.analysis_complete ? t.complete : t.incomplete} {criticalKeys.map(key => t.experience.critical[key]).join(' ')} {t.experience.safety}</p>
            <div className="next-step"><h2>{t.experience.summary}</h2><p>{t.actions[result.action_keys[0]]}</p></div>
            <MessageBubble text={analyzedText} displayText={displayText} evidence={result.evidence} title={t.experience.bubble.title} hint={t.experience.bubble.hint}/>
            <div className="result-controls">
              <button className="submit" type="button" onClick={openGuide}>{t.experience.next}<span aria-hidden="true"> →</span></button>
              <button className="secondary-button" type="button" aria-expanded={details} aria-controls="result-details" onClick={() => setDetails(value => !value)}>{t.experience.why}</button>
            </div>
            <div className="speech-control">
              {speech.supported ? <><button className="text-button listen-button" type="button" onClick={speech.listening ? speech.stop : speech.start}><svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="m11 5-5 4H3v6h3l5 4V5Zm4 3c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>{speech.listening ? t.experience.speech.stop : t.experience.speech.listen}</button><details className="speech-notice"><summary>{t.experience.speechAbout}</summary><p className="small">{t.experience.speech.notice}</p></details></> : <p className="small">{t.experience.speech.unsupported}</p>}
              {speech.error === 'unavailable' && <p className="small error" role="status">{t.experience.speech.unavailable}</p>}
            </div>
            {details && <div id="result-details" className="result-details"><h2>{t.experience.why}</h2>
              {pattern && <section className="possible-pattern" aria-labelledby="pattern-label"><p id="pattern-label" className="small pattern-label">{t.experience.patterns.label}</p><h3>{t.experience.patterns[pattern].title}</h3><p>{t.experience.patterns[pattern].description}</p><p className="small">{t.experience.patterns.caveat}</p></section>}
              <h2>{t.reasons}</h2>
              {result.evidence.length ? <EvidenceDetails evidence={result.evidence} analyzedText={displayText}/> : <p>{t.noEvidence}</p>}
              <h3>{t.steps}</h3><ol>{result.action_keys.map(key => <li key={key}>{t.actions[key]}</li>)}</ol>
              <h3>{t.limitationsLabel}</h3><ul>{result.limitations.map(key => <li key={key}>{t.limitations[key]}</li>)}</ul>
            </div>}
            <div className="privacy-controls">
              <button type="button" className="text-button" aria-pressed={shield} onClick={() => {setShield(value => !value); setMaskFeedback('');}}>{shield ? t.experience.privacy.show : t.experience.privacy.hide}</button>
              {shield && <p className="small" role="status">{t.experience.privacy.distinction}</p>}
              <details><summary>{t.experience.privacy.title}</summary><p className="small">{t.experience.privacy.notice}</p>
                <button className="secondary-button" type="button" aria-expanded={maskEditor} aria-controls="mask-editor" onClick={() => setMaskEditor(value => !value)}>{t.experience.privacy.select}</button>
                {maskEditor && <div id="mask-editor"><label htmlFor="mask-message">{t.experience.privacy.selectionLabel}</label><p id="mask-instruction" className="small">{t.experience.privacy.instruction}</p>
                  <textarea id="mask-message" ref={maskField} readOnly value={displayText} rows={5} aria-describedby="mask-instruction" spellCheck={false}/>
                  <button className="secondary-button" type="button" onClick={hideSelection}>{t.experience.privacy.mask}</button>
                </div>}
                {maskFeedback && <p className="small" role="status">{maskFeedback}</p>}
              </details>
            </div>
            <button type="button" className="text-button help-button" aria-expanded={helpPreview} aria-controls="help-preview" onClick={() => setHelpPreview(value => !value)}>{t.help}</button>
            {helpPreview && <HelpRequest summaryKeys={result.share_summary_keys}/>}
          </section>
          <div ref={guide}><ActionGuide key={guideRevision}/></div>
          {!STATIC_DEMO && <button className="text-button edit-button" type="button" onClick={() => { clearPrevious(); setExample(false); }}>{t.experience.edit}</button>}
        </> : <>
          <h1>{mode === 'screenshot' ? t.scan.title : t.paste}</h1>
          <form onSubmit={submit} noValidate aria-busy={pending}>
            {OCR_ENABLED && <div className="input-method" role="group" aria-label={t.inputMethod}>
              <button type="button" aria-pressed={mode === 'paste'} onClick={() => chooseMode('paste')}>{t.paste}</button>
              <button type="button" aria-pressed={mode === 'screenshot'} onClick={() => chooseMode('screenshot')}>{t.screenshot}</button>
            </div>}
            {mode === 'screenshot' && <SafeScan onText={value => {setText(value); setConfirmed(false); clearPrevious();}} onReady={setOcrReady} onPaste={() => chooseMode('paste')}/>}
            {(mode === 'paste' || ocrReady) && <>
              <label htmlFor="message">{mode === 'screenshot' ? t.scan.review : t.textLabel}</label>
              {mode === 'screenshot' && <p id="ocr-instruction" className="small">{t.scan.instruction}</p>}
              <textarea id="message" ref={textField} value={text} rows={6} placeholder={t.placeholder} autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off"
                aria-invalid={error === 'empty' || error === 'too_long' || error === 'invalid_input'} aria-describedby={`privacy text-limit${mode === 'screenshot' ? ' ocr-instruction' : ''}${error ? ' form-error' : ''}`}
                onChange={event => {setText(event.target.value); setConfirmed(false); setExample(false); clearPrevious();}}/>
              <div className="field-note"><p id="text-limit">{t.limit}</p><span className={textLength(text) > MAX_TEXT_LENGTH ? 'over-limit' : ''}>{textLength(text)} / {MAX_TEXT_LENGTH}</span></div>
              {mode === 'screenshot' && <label className="check-row" htmlFor="confirm-text"><input id="confirm-text" type="checkbox" checked={confirmed} aria-describedby={confirmationError ? 'confirmation-error' : undefined} onChange={event => {setConfirmed(event.target.checked); clearPrevious();}}/><span>{t.scan.confirm}</span></label>}
              {confirmationError && <p id="confirmation-error" className="error" role="alert">{t.scan.confirmationError}</p>}
              <label htmlFor="message-language">{t.languageLabel}</label>
              <select id="message-language" aria-describedby="language-hint" value={messageLanguage} onChange={event => {setMessageLanguage(event.target.value as MessageLanguage); clearPrevious();}}>
                {Object.entries(t.languages).map(([key,label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <p id="language-hint" className="language-hint">{t.languageHint}</p><p id="privacy" className="privacy">{t.privacy}</p>
              {error && <p id="form-error" className="error" role="alert">{t.errors[error]}</p>}
              <button className="submit" disabled={pending} type="submit">{pending ? t.pending : t.submit}<span aria-hidden="true"> →</span></button>
            </>}
          </form>
          <div ref={guide}><ActionGuide key={guideRevision}/></div>
        </>}
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{pending ? t.pending : result ? `${resultLabel}. ${result.analysis_complete ? t.complete : t.incomplete}` : ''}</p>
      </div>}
    </main>}
    <footer><p>{t.footer}</p><p className="prototype-label">{t.prototypeLabel}</p><a onClick={speech.stop} href={BEHIND_URL}>{t.behind}</a></footer>
  </div>;
}
