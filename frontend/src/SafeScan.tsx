import { useEffect, useRef, useState } from 'react';
import { extractText, OcrError } from './ocr';
import type { OcrErrorKey } from './ocr';
import { copy as t } from './copy';

type Props = { onText: (value: string) => void; onReady: (ready: boolean) => void; onPaste: () => void };
export default function SafeScan({ onText, onReady, onPaste }: Props) {
  const [state, setState] = useState<'idle' | 'initializing' | 'reading' | 'done'>('idle');
  const [error, setError] = useState<OcrErrorKey | null>(null);
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const picker = useRef<HTMLInputElement>(null);
  useEffect(() => () => { sequence.current++; request.current?.abort(); }, []);
  function cancel() { sequence.current++; request.current?.abort(); request.current = null; setState('idle'); setError(null); }
  async function choose(file?: File) {
    if (!file) return;
    cancel(); onReady(false); onText('');
    const id = ++sequence.current;
    const controller = new AbortController(); request.current = controller;
    setState('initializing');
    try {
      const text = await extractText(file, controller.signal, () => { if (id === sequence.current) setState('reading'); });
      if (id === sequence.current) { onText(text); onReady(true); setState('done'); }
    } catch (caught) {
      if (id === sequence.current) { setError(caught instanceof OcrError ? caught.key : 'processing'); setState('idle'); }
    } finally {
      if (id === sequence.current) request.current = null;
      if (picker.current) picker.current.value = '';
    }
  }
  const busy = state === 'initializing' || state === 'reading';
  return <section className="safe-scan" aria-labelledby="scan-heading">
    <h2 id="scan-heading" className="input-heading">{t.scan.title}</h2>
    <div className="drop-area" onDragOver={event => event.preventDefault()} onDrop={event => {
      event.preventDefault();
      if (event.dataTransfer.files.length === 1) void choose(event.dataTransfer.files[0]);
      else { cancel(); onText(''); onReady(false); setError('format'); }
    }}>
      <p>{t.scan.drop}</p>
      <p className="small">{t.scan.formats}</p>
      <input className="sr-only" id="screenshot" ref={picker} type="file" accept="image/png,image/jpeg" aria-label={t.scan.choose} tabIndex={-1} onChange={event => void choose(event.target.files?.[0])} />
      <button type="button" className="secondary-button" onClick={() => picker.current?.click()}>{state === 'done' ? t.scan.replace : t.scan.choose}</button>
    </div>
    <p className="small">{t.scan.privacy}</p>
    <p className="small" role="status" aria-live="polite">{state === 'initializing' ? t.scan.initializing : state === 'reading' ? t.scan.reading : state === 'done' ? t.scan.ready : ''}</p>
    {busy && <button type="button" className="secondary-button" onClick={cancel}>{t.scan.cancel}</button>}
    {error && <p role="alert" className="error">{t.scan.errors[error]}</p>}
    {error && <button type="button" className="secondary-button" onClick={onPaste}>{t.scan.fallback}</button>}
  </section>;
}
