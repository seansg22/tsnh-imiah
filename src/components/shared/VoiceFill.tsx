import { useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { callGemini } from '../../lib/gemini';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface Props<T> {
  prompt: (said: string) => string; // system prompt that tells Gemini the JSON shape, built for each note so it can hold the day and its data
  parse: (text: string) => T | null;
  onResult: (data: T, said: string) => UiKey | void; // a UiKey is an error message to show in the popup
  startRef?: { current: (() => void) | null }; // lets the parent start a new recording, for "record again"
}

// Tap, talk, tap Done. Speech -> text (browser) -> JSON (Gemini) -> onResult.
export function VoiceFill<T>({ prompt, parse, onResult, startRef }: Props<T>) {
  const { t } = useLang();
  const { supported, start, modal } = useVoiceInput(async said => {
    const res = await callGemini(prompt(said), [{ role: 'user', parts: [{ text: said }] }]);
    const data = res && parse(res.text);
    return data ? onResult(data, said) : 'voice.fail';
  });
  useEffect(() => { if (startRef) startRef.current = start; }); // every render, so it never holds an old state
  if (!supported) return null;
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <button
        type="button"
        onClick={start}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border-2 border-dashed border-peach/60 bg-white/60 text-xs font-bold text-peachDark hover:bg-white transition-colors"
      >
        <Mic size={14} strokeWidth={2.5} />
        {t('voice.start')}
      </button>
      {modal}
    </div>
  );
}
