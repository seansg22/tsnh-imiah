import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/appStateContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { callAI } from '../../lib/ai';
import { buildAdvicePrompt, type AdviceKind } from '../../lib/advicePrompts';
import { formatDateTime } from '../../i18n/date';
import { useLang } from '../../i18n/langContext';
import { nowTimestamp } from '../../lib/timestamp';

interface Saved {
  text: string;
  timestamp: number;
}

const STEPS = ['ai.advice.step1', 'ai.advice.step2', 'ai.advice.step3'] as const;

function Thinking() {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center py-10">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <span className="advice-glow absolute inset-2 rounded-full bg-peach/40" />
        <span className="advice-glow absolute inset-2 rounded-full bg-peach/30" style={{ animationDelay: '0.8s' }} />
        <Sparkles size={34} strokeWidth={2} className="advice-float relative text-peachDark" />
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="advice-orbit absolute left-1/2 top-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-peach"
            style={{ animationDuration: `${2.4 + i * 0.9}s`, animationDelay: `${-i * 0.8}s`, ['--r' as string]: `${34 + i * 6}px` }}
          />
        ))}
      </div>
      <p key={step} className="advice-shimmer fade-in mt-5 text-sm font-bold">{t(STEPS[step])}</p>
    </div>
  );
}

export function AdviceModal({ kind, onClose }: { kind: AdviceKind; onClose: () => void }) {
  const { t, lang } = useLang();
  const { state } = useApp();
  const [saved, setSaved] = useLocalStorage<Saved | null>(`ai-advice-${kind}`, null);
  const [loading, setLoading] = useState(!saved); // first open with nothing saved: the effect below asks right away
  const [error, setError] = useState(false);
  const [status, setStatus] = useState('');

  function run() {
    const { system, user } = buildAdvicePrompt(kind, state, lang);
    callAI(system, [{ role: 'user', content: user }], setStatus).then(result => {
      if (result) setSaved({ text: result.text, timestamp: nowTimestamp() });
      else setError(true);
      setLoading(false);
    });
  }

  function ask() {
    setLoading(true);
    setError(false);
    setStatus('');
    run();
  }

  // lock page scroll while open, so scrolling only moves the popup
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (loading) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // portal: the page root has a transform (fade-in), which would trap this overlay under the bottom nav
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 px-4 touch-none"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      onClick={onClose}
    >
      <div
        className="fade-in w-full max-w-[400px] max-h-[calc(100dvh-2rem)] flex flex-col touch-auto bg-cream rounded-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-shrink-0">
          <Sparkles size={18} strokeWidth={2.5} className="text-peachDark" />
          <h2 className="flex-1 text-base font-extrabold text-app-text">{t('ai.advice.title')}</h2>
          <button onClick={onClose} aria-label={t('ai.advice.close')} className="p-1.5 text-textMuted hover:text-app-text">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto overscroll-contain">
          {loading ? (
            <>
              <Thinking />
              {status && <p className="text-center text-xs text-textMuted">{status}</p>}
            </>
          ) : (
            <>
              {error && <p className="text-sm text-red-500 font-semibold mb-3">{t('ai.failed')}</p>}
              {saved && !error && (
                <>
                  <div className="prose prose-sm prose-neutral max-w-none">
                    <ReactMarkdown>{saved.text}</ReactMarkdown>
                  </div>
                  <p className="mt-3 text-xs text-textMuted">{t('ai.advice.updated', { date: formatDateTime(saved.timestamp, lang) })}</p>
                </>
              )}
              <button
                onClick={ask}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-sm font-extrabold shadow-md shadow-fuchsia-300/50 active:scale-95 transition-transform"
              >
                <RefreshCw size={14} strokeWidth={2.5} />
                {t('ai.advice.again')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
