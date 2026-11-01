import type { SleepEntry } from '../types';

export const SLEEP_WAYS = ['rocked', 'fed', 'own', 'carried', 'stroller', 'pacifier'] as const;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// minutes asleep; an end at or before the start means it ran past midnight
export function sleepMinutes(start: string, end: string): number {
  const diff = toMin(end) - toMin(start);
  return diff > 0 ? diff : diff + 24 * 60;
}

// "9h 30m", "2h", "45m"
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h > 0 && `${h}h`, (m > 0 || h === 0) && `${m}m`].filter(Boolean).join(' ');
}

export const hhmm = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

// a day has one night sleep (naps can be many); ignoreId lets an entry being edited keep its own day
export const hasNightSleep = (entries: SleepEntry[], date: string, ignoreId?: string) =>
  entries.some(e => e.kind === 'night' && e.date === date && e.id !== ignoreId);

export interface SleepDay {
  date: string;
  naps: SleepEntry[]; // earliest first
  nights: SleepEntry[];
  napMin: number;
  nightMin: number;
  totalMin: number;
}

// one item per date, newest date first; naps and night sleep kept apart
export function groupByDay(entries: SleepEntry[]): SleepDay[] {
  const days = new Map<string, SleepDay>();
  for (const e of entries) {
    const day = days.get(e.date) ?? { date: e.date, naps: [], nights: [], napMin: 0, nightMin: 0, totalMin: 0 };
    const min = sleepMinutes(e.start, e.end);
    if (e.kind === 'nap') {
      day.naps.push(e);
      day.napMin += min;
    } else {
      day.nights.push(e);
      day.nightMin += min;
    }
    day.totalMin += min;
    days.set(e.date, day);
  }
  const byStart = (a: SleepEntry, b: SleepEntry) => a.start.localeCompare(b.start);
  return [...days.values()]
    .map(d => ({ ...d, naps: [...d.naps].sort(byStart), nights: [...d.nights].sort(byStart) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
