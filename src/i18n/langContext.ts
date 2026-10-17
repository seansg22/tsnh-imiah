import { createContext, useContext } from 'react';
import type { UiKey } from './ui';

export type Lang = 'vi' | 'en';

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
}

export const LangContext = createContext<LangState | null>(null);

export function useLang(): LangState {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
