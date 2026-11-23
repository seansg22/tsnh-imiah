import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Loader2 } from 'lucide-react';
import { useLang } from '../i18n/langContext';
import type { UiKey } from '../i18n/ui';

const KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const canRecord = !!KEY && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

type Handler = (said: string) => Promise<UiKey | void> | UiKey | void; // a UiKey is an error message for the popup

// https://console.groq.com/keys - Whisper turns the recording into text. Works on iOS Safari (records audio/mp4).
async function transcribe(blob: Blob, lang: string, hint?: string): Promise<string> {
  const form = new FormData();
  form.append('file', blob, `voice.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
  form.append('model', 'whisper-large-v3-turbo');
  form.append('language', lang === 'vi' ? 'vi' : 'en');
  if (hint) form.append('prompt', hint); // words to expect, helps names Whisper would misspell
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: form,
  });
  if (!res.ok) throw new Error(String(res.status));
  return ((await res.json()) as { text: string }).text;
}

// Mic -> recording -> Groq Whisper -> handle(text). Tap, talk, tap Done.
// The popups sit above the Ask screen, which is a full-page layer at z-[100].
// Returns the popups (listening, working, error) to render, a start function, and whether the browser can do it.
// ponytail: no live text while talking (Whisper works on the whole clip), and the key ships in the bundle like the other keys.
export function useVoiceInput(handle: Handler, hint?: () => string) {
  const { t, lang } = useLang();
  const [state, setState] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<UiKey | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const cancelled = useRef(false);
  const canvas = useRef<HTMLCanvasElement | null>(null); // the wave is drawn straight from the volume loop, no re-render

  async function send(blob: Blob) {
    setState('thinking');
    const said = await transcribe(blob, lang, hint?.()).then(x => x.trim(), () => '');
    if (!said) {
      setState('idle');
      return setError('voice.fail');
    }
    setText(said);
    const problem = await handle(said);
    setState('idle');
    if (problem) setError(problem);
  }

  async function start() {
    if (state !== 'idle' || !canRecord) return;
    setError(null);
    setText('');
    const ctx = new AudioContext(); // made before the first await: iOS only allows it inside the tap
    void ctx.resume();
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      void ctx.close();
      return setError('voice.denied');
    }
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const wave = new Uint8Array(analyser.fftSize);
    let frame = 0;
    const W = 480, H = 96, BAR = 6, STEP = 10, EVERY = 70; // a bar is 6 wide, one new bar every 70ms
    const frozen: number[] = new Array(Math.floor(W / STEP) - 1).fill(0); // oldest first
    let live = 0; // the newest bar, still growing with the voice
    let lastFreeze = 0;
    const loop = (now = 0) => {
      if (ctx.state === 'suspended') void ctx.resume(); // iOS can suspend it again
      if (!lastFreeze) lastFreeze = now;
      analyser.getByteTimeDomainData(wave);
      let sum = 0;
      for (const v of wave) sum += ((v - 128) / 128) ** 2;
      const target = Math.min(1, Math.sqrt(sum / wave.length) * 5);
      live += (target - live) * (target > live ? 0.5 : 0.15); // quick up, slow down: no flicker
      while (now - lastFreeze >= EVERY) { // the live bar becomes a fixed one, a new live bar starts
        lastFreeze += EVERY;
        frozen.push(live);
        frozen.shift();
      }
      const p = (now - lastFreeze) / EVERY; // 0..1, slides everything left a little each frame
      const g = canvas.current?.getContext('2d');
      if (g) {
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#FFAB76'; // peach
        [...frozen, live].forEach((l, i) => {
          const h = Math.max(BAR, l * H);
          g.beginPath();
          g.roundRect((i - p) * STEP, (H - h) / 2, BAR, h, BAR / 2);
          g.fill();
        });
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    const r = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    cancelled.current = false;
    r.ondataavailable = e => chunks.push(e.data);
    r.onstop = () => {
      cancelAnimationFrame(frame);
      void ctx.close();
      stream.getTracks().forEach(x => x.stop()); // turns the mic indicator off
      if (!cancelled.current) void send(new Blob(chunks, { type: r.mimeType }));
    };
    rec.current = r;
    r.start();
    setState('listening');
  }

  function cancel() {
    cancelled.current = true;
    rec.current?.stop();
    rec.current = null;
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
            <div className="flex gap-2">
              <button onClick={() => setError(null)} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">{t('voice.close')}</button>
              {error === 'voice.denied' ? ( // iOS only asks again after a reload
                <button onClick={() => location.reload()} className="flex-1 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">{t('voice.reload')}</button>
              ) : <button onClick={() => { setError(null); void start(); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">
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
            {listening ? (
              <canvas ref={canvas} width={480} height={96} className="mx-auto h-16 w-full" aria-hidden="true" />
            ) : (
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peach text-white">
                <Loader2 size={28} strokeWidth={2.5} className="animate-spin" />
              </span>
            )}
            <p className="text-base font-extrabold text-app-text">{t(listening ? 'voice.listening' : 'voice.thinking')}</p>
            <p className="min-h-10 text-sm text-textMuted italic [overflow-wrap:anywhere]">{text ? `"${text}"` : listening && t('voice.hint')}</p>
            {listening && (
              <div className="flex gap-2">
                <button onClick={cancel} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">{t('confirm.cancel')}</button>
                <button onClick={() => rec.current?.stop()} className="flex-1 py-2.5 rounded-xl bg-peach text-sm font-bold text-white active:opacity-80">{t('voice.done')}</button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );

  return { supported: canRecord, start: () => void start(), modal };
}
