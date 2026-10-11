import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalyzeResponse } from './api';
import { copy } from './copy';

export type SpeechError = 'unsupported' | 'unavailable';
export type SpeechState = { supported: boolean; listening: boolean; error: SpeechError | null };
export type SpeechPlatform = {
  synthesis: Pick<SpeechSynthesis, 'getVoices' | 'speak' | 'cancel'>;
  createUtterance: (text: string) => SpeechSynthesisUtterance;
};

function fixedCopy<T extends string>(dictionary: Record<T, string>, key: T): string {
  if (!Object.hasOwn(dictionary, key) || typeof dictionary[key] !== 'string') throw new Error('invalid_speech_keys');
  return dictionary[key];
}

/** Source text is deliberately absent from this interface and every lookup. */
export function buildResultSpeech(result: AnalyzeResponse): string {
  const pieces = [fixedCopy(copy.headlines, result.headline_key)];
  if (!result.analysis_complete) pieces.push(copy.incomplete);
  const criticalGroups: AnalyzeResponse['limitations'][number][][] = [
    ['model_not_ready', 'inference_unavailable'],
    ['insufficient_text', 'incomplete_coverage'],
    ['language_not_evaluated', 'language_unspecified'],
  ];
  for (const group of criticalGroups) {
    const key = group.find(item => result.limitations.includes(item));
    if (key) pieces.push(fixedCopy(copy.experience.critical, key));
  }
  if (result.evidence.length) pieces.push(fixedCopy(copy.experience.simpleReasons, result.evidence[0].key));
  if (result.action_keys.length) pieces.push(fixedCopy(copy.actions, result.action_keys[0]));
  pieces.push(copy.limitations.not_a_safety_confirmation);
  return pieces.join(' ');
}

export type ReadAloudController = {
  readonly state: SpeechState;
  start: (result: AnalyzeResponse | null) => void;
  stop: () => void;
  dispose: () => void;
};

/** The browser's voice service only receives approved fixed guidance. */
export function createReadAloudController(
  platform: SpeechPlatform | null,
  onState: (state: SpeechState) => void = () => {},
): ReadAloudController {
  let state: SpeechState = { supported: platform !== null, listening: false, error: null };
  let active: SpeechSynthesisUtterance | null = null;
  let revision = 0;
  let disposed = false;
  const publish = (next: SpeechState) => { state = next; if (!disposed) onState(next); };
  const detach = () => {
    if (active) { active.onstart = null; active.onend = null; active.onerror = null; }
    active = null;
  };
  const halt = (): boolean => {
    revision++;
    detach();
    try { platform?.synthesis.cancel(); return true; } catch { return false; }
  };
  const stop = () => {
    if (disposed) return;
    const cancelled = halt();
    publish({ supported: platform !== null, listening: false, error: cancelled ? null : 'unavailable' });
  };
  return {
    get state() { return state; },
    start(result) {
      if (disposed) return;
      const cancelled = halt();
      if (!result) { publish({ supported: platform !== null, listening: false, error: null }); return; }
      if (!platform) { publish({ supported: false, listening: false, error: 'unsupported' }); return; }
      if (!cancelled) { publish({ supported: true, listening: false, error: 'unavailable' }); return; }
      try {
        const utterance = platform.createUtterance(buildResultSpeech(result));
        const english = platform.synthesis.getVoices().filter(voice => /^en(?:[-_]|$)/i.test(voice.lang));
        const local = english.filter(voice => voice.localService);
        const voice = local.find(item => item.default) ?? local[0] ?? english.find(item => item.default) ?? english[0];
        if (voice) utterance.voice = voice;
        utterance.lang = 'en';
        utterance.rate = 1;
        active = utterance;
        const currentRevision = revision;
        const stillCurrent = () => !disposed && currentRevision === revision && active === utterance;
        utterance.onstart = () => { if (stillCurrent()) publish({ supported: true, listening: true, error: null }); };
        utterance.onend = () => {
          if (stillCurrent()) { detach(); publish({ supported: true, listening: false, error: null }); }
        };
        utterance.onerror = () => {
          if (stillCurrent()) { detach(); publish({ supported: true, listening: false, error: 'unavailable' }); }
        };
        publish({ supported: true, listening: true, error: null });
        platform.synthesis.speak(utterance);
      } catch {
        halt();
        publish({ supported: true, listening: false, error: 'unavailable' });
      }
    },
    stop,
    dispose() {
      if (disposed) return;
      disposed = true;
      halt();
      state = { supported: platform !== null, listening: false, error: null };
    },
  };
}

function browserPlatform(): SpeechPlatform | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function' ||
      typeof window.speechSynthesis.speak !== 'function' || typeof window.speechSynthesis.cancel !== 'function' ||
      typeof window.speechSynthesis.getVoices !== 'function') return null;
    return { synthesis: window.speechSynthesis, createUtterance: text => new window.SpeechSynthesisUtterance(text) };
  } catch { return null; }
}

export function useReadAloud(result: AnalyzeResponse | null, resetKey?: number | string) {
  const resultRef = useRef(result);
  resultRef.current = result;
  const controller = useRef<ReadAloudController | null>(null);
  const [state, setState] = useState<SpeechState>({ supported: false, listening: false, error: null });
  useEffect(() => {
    const owner = createReadAloudController(browserPlatform(), setState);
    controller.current = owner;
    setState(owner.state);
    const stop = () => owner.stop();
    window.addEventListener('pagehide', stop);
    window.addEventListener('popstate', stop);
    return () => {
      window.removeEventListener('pagehide', stop);
      window.removeEventListener('popstate', stop);
      owner.dispose();
      if (controller.current === owner) controller.current = null;
    };
  }, []);
  useEffect(() => { controller.current?.stop(); }, [result, resetKey]);
  const start = useCallback(() => { controller.current?.start(resultRef.current); }, []);
  const stop = useCallback(() => { controller.current?.stop(); }, []);
  return { ...state, start, stop };
}
