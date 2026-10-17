import { useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LangContext, type Lang } from './langContext';
import { translate } from './ui';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>('baby-day:lang', 'vi');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(lang, key, vars);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
