import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Loader2 } from 'lucide-react';
import { useLang } from '../i18n/langContext';
import type { UiKey } from '../i18n/ui';

// the browser API has no type in lib.dom yet, so only what we use
interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
}
type RecognitionCtor = new () => Recognition;
const Ctor = (window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor });
const Speech = Ctor.SpeechRecognition ?? Ctor.webkitSpeechRecognition;
// One object for every session and every voice button: iOS may count a new object as a new mic request
let shared: Recognition | null = null;

type Handler = (said: string) => Promise<UiKey | void> | UiKey | void; // a UiKey is an error message for the popup

// Speech -> text (browser) -> handle(text). Tap, talk, tap Done.
// The popups sit above the Ask screen, which is a full-page layer at z-[100].
// Returns the popups (listening, working, error) to render, a start function, and whether the browser can do it.
// ponytail: Firefox and some iOS versions have no speech API, the caller hides its button then.
export function useVoiceInput(handle: Handler) {
  const { t, lang } = useLang();
  const [state, setState] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<UiKey | null>(null);
  const rec = useRef<Recognition | null>(null);
  const [dbg, setDbg] = useState(''); // ponytail: TEMPORARY debug line, remove once the iOS problem is found
  const stopping = useRef(false); // the user tapped Done

  async function send(said: string) {
    if (!said.trim()) return setState('idle');
    setState('thinking');
    const problem = await handle(said);
    setState('idle');
    if (problem) setError(problem);
  }

  // Listens until the user taps Done. The browser ends a session by itself after a pause (or about a minute),
  // so each time that happens a new session starts and the text so far is kept.
  function start() {
    if (state !== 'idle' || !Speech) return;
    let done = ''; // text of the sessions that already ended
    let retries = 0; // fresh sessions started because the last one heard nothing
    const t0 = Date.now();
    const log = (what: string) => setDbg(d => `${d}${d ? ' | ' : ''}${((Date.now() - t0) / 1000).toFixed(1)}s ${what}`.slice(-600));
    setDbg('');
    stopping.current = false;
    const run = () => {
      const r = (shared ??= new Speech());
      r.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      r.interimResults = true;
      r.continuous = true;
      let cur = '';
      let heard = false; // this session got speech or text
      let watch: ReturnType<typeof setTimeout> | undefined;
      for (const n of ['start', 'audiostart', 'soundstart', 'speechstart', 'speechend', 'soundend', 'audioend', 'nomatch']) {
        (r as unknown as Record<string, () => void>)[`on${n}`] = () => { if (n === 'speechstart') heard = true; log(n); };
      }
      r.onresult = e => {
        heard = true;
        log(`result${e.results.length}`);
        cur = Array.from(e.results).map(x => x[0].transcript).join(' ');
        setText(`${done} ${cur}`.trim());
      };
      r.onerror = e => {
        log(`ERROR ${e.error}`);
        clearTimeout(watch);
        if (e.error === 'no-speech' || e.error === 'aborted') return; // just silence: onend starts the next session
        rec.current = null; // mic blocked, no network...: stop for real
        shared = null; // next time starts with a fresh object
        setState('idle');
        setError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'voice.denied' : 'voice.fail');
      };
      r.onend = () => {
        log(rec.current === r ? 'end' : 'end(cancelled)');
        clearTimeout(watch);
        if (rec.current !== r) return; // cancelled or failed
        done = `${done} ${cur}`.trim();
        if (stopping.current) void send(done);
        else run();
      };
      rec.current = r;
      try {
        r.start();
        // iOS can start a session that never hears anything (seen on the second note): drop it and start a fresh one
        watch = setTimeout(() => {
          if (rec.current !== r || heard || done || retries >= 3) return;
          retries++;
          log('heard nothing, new session');
          rec.current = null;
          shared = null;
          r.abort();
          run();
        }, 3000);
      } catch { // still stopping from the last note
        rec.current = null;
        shared = null;
        setState('idle');
        setError('voice.fail');
      }
    };
    setError(null);
    setText('');
    setState('listening');
    run();
  }

  function cancel() {
    const r = rec.current;
    rec.current = null;
    r?.stop();
    setState('idle');
  }

  const listening = state === 'listening';

  const modal = (
    <>
      {error && createPortal( // portal: the page fade-in would trap position: fixed
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-6" onClick={() => setError(null)}>
          <div role="alertdialog" aria-modal="true" className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-xl space-y-3" onClick={e => e.stopPropagation()}>
            <p className="text-base font-extrabold text-red-500">{t(error)}</p>
            {text && <p className="text-sm text-textMuted italic [overflow-wrap:anywhere]">"{text}"</p>}
            <p className="text-[10px] leading-tight font-mono text-textMuted [overflow-wrap:anywhere]">{dbg}</p>
            <div className="flex gap-2">
              <button onClick={() => setError(null)} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">{t('voice.close')}</button>
              {error === 'voice.denied' ? ( // iOS only asks again after a reload
                <button onClick={() => location.reload()} className="flex-1 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">{t('voice.reload')}</button>
              ) : <button onClick={() => { setError(null); start(); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">
                <Mic size={14} strokeWidth={2.5} />
                {t('voice.retry')}
              </button>}
            </div>
          </div>
        </div>,
        document.body,
      )}
      {state !== 'idle' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-6">
          <div role="dialog" aria-modal="true" className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-xl text-center space-y-3">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-peach/40" />}
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-peach text-white">
                {listening ? <Mic size={28} strokeWidth={2.5} /> : <Loader2 size={28} strokeWidth={2.5} className="animate-spin" />}
              </span>
            </div>
            <p className="text-base font-extrabold text-app-text">{t(listening ? 'voice.listening' : 'voice.thinking')}</p>
            <p className="min-h-10 text-sm text-textMuted italic [overflow-wrap:anywhere]">{text && `"${text}"`}</p>
            <p className="text-[10px] leading-tight text-left font-mono text-textMuted [overflow-wrap:anywhere]">{dbg}</p>
            {listening && (
              <div className="flex gap-2">
                <button onClick={cancel} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">{t('confirm.cancel')}</button>
                <button onClick={() => { stopping.current = true; rec.current?.stop(); }} className="flex-1 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">{t('voice.done')}</button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );

  return { supported: !!Speech, start, modal };
}
