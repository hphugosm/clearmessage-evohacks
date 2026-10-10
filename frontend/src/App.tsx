import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { analyze, AnalysisError, MAX_TEXT_LENGTH, textLength, validateText } from './api';
import type { AnalyzeResponse, ClientErrorKey, MessageLanguage } from './api';
import { copy } from './copy';
import type { UiLanguage } from './copy';

export default function App() {
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('cs');
  const [messageLanguage, setMessageLanguage] = useState<MessageLanguage>('auto');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<ClientErrorKey | null>(null);
  const textField = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const t = copy[uiLanguage];

  useEffect(() => { document.documentElement.lang = uiLanguage; }, [uiLanguage]);
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setResult(null);
    const invalid = validateText(text);
    setError(invalid);
    if (invalid) { textField.current?.focus(); return; }
    setPending(true);
    try {
      setResult(await analyze({ text, message_language: messageLanguage }));
    } catch (caught) {
      setError(caught instanceof AnalysisError ? caught.key : 'unavailable');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <header>
        <span className="brand">Klidná zpráva<span className="brand-dot" aria-hidden="true">.</span></span>
        <nav aria-label="Jazyk rozhraní / Interface language">
          <button type="button" aria-pressed={uiLanguage === 'cs'} onClick={() => setUiLanguage('cs')}>Česky</button>
          <button type="button" aria-pressed={uiLanguage === 'en'} onClick={() => setUiLanguage('en')}>English</button>
        </nav>
      </header>
      <main>
        <p className="eyebrow">{t.tagline}</p>
        <h1>{t.title}</h1>
        <p className="intro">{t.intro}</p>
        <p className="stage">{t.stage}</p>
        <form onSubmit={submit} noValidate aria-busy={pending}>
          <label htmlFor="message">{t.textLabel}</label>
          <textarea id="message" ref={textField} value={text} rows={7} placeholder={t.placeholder}
            disabled={pending} autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off"
            aria-invalid={error === 'empty' || error === 'too_long' || error === 'invalid_input'}
            aria-describedby={`privacy text-limit${error ? ' form-error' : ''}`}
            onChange={event => { setText(event.target.value); setResult(null); setError(null); }} />
          <div className="field-note"><p id="text-limit">{t.limit}</p><span className={textLength(text) > MAX_TEXT_LENGTH ? 'over-limit' : ''}>{textLength(text)} / {MAX_TEXT_LENGTH}</span></div>
          <label htmlFor="message-language">{t.languageLabel}</label>
          <select id="message-language" value={messageLanguage} disabled={pending}
            onChange={event => { setMessageLanguage(event.target.value as MessageLanguage); setResult(null); setError(null); }}>
            {Object.entries(t.languages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <p id="privacy" className="privacy">{t.privacy}</p>
          {error && <p id="form-error" className="error" role="alert">{t.errors[error]}</p>}
          <button className="submit" disabled={pending} type="submit">{pending ? t.pending : t.submit}</button>
          <p className="sr-only" role="status" aria-live="polite">{pending ? t.pending : ''}</p>
        </form>
        <div aria-live="polite" aria-atomic="true">
          {result && <section className="result" aria-labelledby="result-heading">
            <p className="eyebrow">{t.resultLabel}</p>
            <h2 id="result-heading" tabIndex={-1} ref={resultHeading}>{t.headline}</h2>
            <p>{t.resultDetail}</p>
            <h3>{t.steps}</h3>
            <ol>{result.action_keys.map(key => <li key={key}>{t.actions[key]}</li>)}</ol>
            <h3>{t.limitationsLabel}</h3>
            <ul>{result.limitations.map(key => <li key={key}>{t.limitations[key]}</li>)}</ul>
          </section>}
        </div>
      </main>
      <footer>{t.footer}</footer>
    </div>
  );
}
