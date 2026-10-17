import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Lang } from './langContext';

export function formatDate(date: Date | number | string, pattern: string, lang: Lang): string {
  return format(date, pattern, lang === 'vi' ? { locale: vi } : undefined);
}

export function formatDateTime(date: Date | number | string, lang: Lang): string {
  return new Date(date).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');
}
