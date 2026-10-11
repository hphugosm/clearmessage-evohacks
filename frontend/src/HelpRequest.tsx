import { useEffect, useRef, useState } from 'react';
import type { AnalyzeResponse } from './api';
import { copy as t } from './copy';
import { buildHelpDraft } from './help';

// Only allowlisted keys cross this boundary, never the source message or evidence.
export default function HelpRequest({ summaryKeys }: { summaryKeys: AnalyzeResponse['share_summary_keys'] }) {
  const draft = buildHelpDraft(summaryKeys);
  const preview = useRef<HTMLTextAreaElement>(null);
  const operationId = useRef(0);
  const [pending, setPending] = useState<'copy' | 'share' | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    preview.current?.focus();
    return () => { operationId.current++; };
  }, []);

  async function copyDraft() {
    if (pending) return;
    const id = ++operationId.current;
    setPending('copy');
    setFeedback('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(draft);
      if (id === operationId.current) setFeedback(t.copied);
    } catch {
      if (id === operationId.current) {
        setFeedback(t.copyUnavailable);
        preview.current?.focus();
        preview.current?.select();
      }
    } finally {
      if (id === operationId.current) setPending(null);
    }
  }

  async function shareDraft() {
    if (pending) return;
    const id = ++operationId.current;
    setPending('share');
    setFeedback('');
    try {
      await navigator.share({ text: draft });
      // Resolving the native dialog does not prove delivery to anyone.
    } catch (caught) {
      if (id === operationId.current) setFeedback(
        caught instanceof DOMException && caught.name === 'AbortError' ? t.shareCancelled : t.shareUnavailable,
      );
    } finally {
      if (id === operationId.current) setPending(null);
    }
  }

  return <div id="help-preview" className="help-preview">
    <label htmlFor="help-draft">{t.helpPreview}</label>
    <p id="help-notice">{t.helpNotice}</p>
    <textarea id="help-draft" ref={preview} aria-describedby="help-notice" readOnly value={draft} rows={6} />
    <button type="button" className="help-button" disabled={pending !== null} onClick={copyDraft}>{pending === 'copy' ? t.copying : t.copyHelp}</button>
    {typeof navigator.share === 'function' && <button type="button" className="help-button" disabled={pending !== null} onClick={shareDraft}>{pending === 'share' ? t.sharing : t.share}</button>}
    <p role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
  </div>;
}
