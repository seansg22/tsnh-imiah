import { differenceInDays, parseISO } from 'date-fns';
import { formatDuration, groupByDay } from './sleep';
import { milkTotals } from './milkTotal';
import { solidsOf } from './solids';
import { MAX_WEEK, percentileOfZ, zScoreOf, type GrowthMetric } from '../data/whoGrowthData';
import type { AppState } from '../types';

// Older diary days, squeezed into one line per week (last 8 weeks) or per 4 weeks (older).
// Each line has averages plus the abnormal days. Plain rules, no AI.
export const RECENT_DAYS = 7; // these stay as full daily rows (foodData / sleepData)
const WEEKLY_WEEKS = 8;
const MAX_FLAGS = 3; // abnormal days listed per line

interface DigestDay {
  date: string;
  nums: Record<string, number>;
  flags: string[]; // reasons this day is abnormal on its own
}

// a day is abnormal when a number is outside [lo, hi] x the median of its line (needs 3+ days)
interface Spread { key: string; lo: number; hi: number; label: string; fmt: (n: number) => string }

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const avgOf = (days: DigestDay[], key: string) => {
  const xs = days.map(d => d.nums[key]).filter((n): n is number => n !== undefined);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;
};
const round1 = (n: number) => Math.round(n * 10) / 10;

function digest(
  days: DigestDay[], birthDate: string, today: Date,
  spreads: Spread[], summary: (avg: (key: string) => number | undefined) => string,
): string {
  const weekOf = (d: Date | string) => Math.floor(differenceInDays(typeof d === 'string' ? parseISO(d) : d, parseISO(birthDate)) / 7);
  const nowWeek = weekOf(today);
  const lines = new Map<number, { label: string; days: DigestDay[] }>(); // key = first week of the line
  for (const day of days) {
    const w = weekOf(day.date);
    const weekly = nowWeek - w <= WEEKLY_WEEKS;
    const start = weekly ? w : Math.floor(w / 4) * 4;
    const line = lines.get(start) ?? { label: weekly ? `week ${w}` : `weeks ${start}-${start + 3}`, days: [] };
    line.days.push(day);
    lines.set(start, line);
  }
  return [...lines.entries()].sort((a, b) => b[0] - a[0]).map(([, { label, days: ds }]) => {
    const flagged = ds.flatMap(d => d.flags.map(f => ({ date: d.date, text: f })));
    for (const s of spreads) {
      const xs = ds.map(d => d.nums[s.key]).filter((n): n is number => n !== undefined);
      if (xs.length < 3) continue;
      const mid = median(xs);
      for (const d of ds) {
        const n = d.nums[s.key];
        if (n !== undefined && (n < mid * s.lo || n > mid * s.hi)) flagged.push({ date: d.date, text: `${s.label} ${s.fmt(n)} (usual ${s.fmt(mid)})` });
      }
    }
    const shown = flagged.slice(0, MAX_FLAGS).map(f => `${f.date.slice(5)} ${f.text}`);
    const more = flagged.length > MAX_FLAGS ? `; +${flagged.length - MAX_FLAGS} more` : '';
    const abnormal = shown.length ? ` | ABNORMAL: ${shown.join('; ')}${more}` : '';
    return `- ${label} (${ds.length} days logged): ${summary(k => avgOf(ds, k))}${abnormal}`;
  }).join('\n');
}

const BAD_POOP = ['black', 'red', 'pale', 'watery', 'hard'];

export function foodHistory(state: AppState, today = new Date(), recentDays = RECENT_DAYS): string {
  const days: DigestDay[] = [...state.foodEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(recentDays).map(e => {
    const ml = milkTotals(e).all.ml;
    const nums: Record<string, number> = { solids: solidsOf(e).length };
    if (ml > 0) nums.milk = ml;
    if (e.poop?.times !== undefined) nums.poop = e.poop.times;
    const flags = [
      ...(e.allergy?.length ? [`reaction: ${e.allergy.join(', ')}`] : []),
      ...[...(e.poop?.colors ?? []), ...(e.poop?.textures ?? [])].filter(c => BAD_POOP.includes(c)).map(c => `${c} poop`),
    ];
    return { date: e.date, nums, flags };
  });
  return digest(days, state.babyProfile!.birthDate, today,
    [{ key: 'milk', lo: 0.6, hi: 1.4, label: 'milk', fmt: n => `${Math.round(n)} ml` }],
    avg => [
      avg('milk') !== undefined && `milk ${Math.round(avg('milk')!)} ml/day`,
      `solids ${round1(avg('solids') ?? 0)}x/day`,
      avg('poop') !== undefined && `poop ${round1(avg('poop')!)}x/day`,
    ].filter(Boolean).join(', '));
}

export function sleepHistory(state: AppState, today = new Date(), recentDays = RECENT_DAYS): string {
  const days: DigestDay[] = groupByDay(state.sleepEntries).slice(recentDays).map(d => {
    const nums: Record<string, number> = { total: d.totalMin, naps: d.naps.length };
    const wakes = d.nights.map(n => n.wakeUps).filter((n): n is number => n !== undefined);
    if (wakes.length) nums.wakes = wakes.reduce((a, b) => a + b, 0);
    const falls = [...d.naps, ...d.nights].map(e => e.fallAsleepMin).filter((n): n is number => n !== undefined);
    if (falls.length) nums.fall = falls.reduce((a, b) => a + b, 0) / falls.length;
    return { date: d.date, nums, flags: (nums.wakes ?? 0) >= 4 ? [`woke ${nums.wakes}x at night`] : [] };
  });
  return digest(days, state.babyProfile!.birthDate, today,
    [{ key: 'total', lo: 0.7, hi: 1.3, label: 'total sleep', fmt: n => formatDuration(Math.round(n)) }],
    avg => [
      `sleep ${formatDuration(Math.round(avg('total') ?? 0))}/day`,
      `${round1(avg('naps') ?? 0)} naps`,
      avg('wakes') !== undefined && `${round1(avg('wakes')!)} night wake-ups`,
      avg('fall') !== undefined && `${Math.round(avg('fall')!)} min to fall asleep`,
    ].filter(Boolean).join(', '));
}

export const RECENT_GROWTH = 4; // newest measurements stay as full rows (growthData)
const METRICS: GrowthMetric[] = ['weight', 'length', 'head'];
const UNIT = { weight: 'kg', length: 'cm', head: 'cm' };

// Older measurements: one line per 4 weeks of age (first -> last value and WHO percentile).
// Abnormal = percentile under 3 or over 97, a jump of 25+ percentile points since the
// previous measurement, or weight going down.
export function growthHistory(state: AppState): string {
  const baby = state.babyProfile!;
  const all = [...state.growthEntries].sort((a, b) => a.date.localeCompare(b.date));
  const prev: Partial<Record<GrowthMetric, { v: number; p?: number }>> = {};
  const rows = all.map((e, i) => {
    const week = differenceInDays(parseISO(e.date), parseISO(baby.birthDate)) / 7;
    const flags: string[] = [];
    const vals: Partial<Record<GrowthMetric, { v: number; p?: number }>> = {};
    for (const m of METRICS) {
      const v = e[m];
      if (v === undefined) continue;
      const p = week >= 0 && week <= MAX_WEEK ? Math.round(percentileOfZ(zScoreOf(m, week, baby.gender, v))) : undefined;
      vals[m] = { v, p };
      const before = prev[m];
      if (p !== undefined && (p < 3 || p > 97)) flags.push(`${m} P${p} (${p < 3 ? 'very low' : 'very high'})`);
      if (before?.p !== undefined && p !== undefined && Math.abs(p - before.p) >= 25) flags.push(`${m} P${before.p} -> P${p}`);
      if (m === 'weight' && before && v < before.v) flags.push(`weight down ${round1(before.v - v)} kg`);
      prev[m] = { v, p };
    }
    return { date: e.date, week: Math.floor(week), vals, flags, old: i < all.length - RECENT_GROWTH };
  }).filter(r => r.old);

  const lines = new Map<number, typeof rows>();
  for (const r of rows) {
    const start = Math.floor(Math.max(r.week, 0) / 4) * 4;
    lines.set(start, [...(lines.get(start) ?? []), r]);
  }
  return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([start, rs]) => {
    const parts = METRICS.flatMap(m => {
      const got = rs.filter(r => r.vals[m]).map(r => r.vals[m]!);
      if (!got.length) return [];
      const [a, b] = [got[0], got[got.length - 1]];
      const pct = (x: { p?: number }) => (x.p !== undefined ? ` P${x.p}` : '');
      return [got.length === 1 ? `${m} ${a.v} ${UNIT[m]}${pct(a)}` : `${m} ${a.v}${pct(a)} -> ${b.v} ${UNIT[m]}${pct(b)}`];
    });
    const flagged = rs.flatMap(r => r.flags.map(f => `${r.date.slice(5)} ${f}`));
    const more = flagged.length > MAX_FLAGS ? `; +${flagged.length - MAX_FLAGS} more` : '';
    const abnormal = flagged.length ? ` | ABNORMAL: ${flagged.slice(0, MAX_FLAGS).join('; ')}${more}` : '';
    return `- weeks ${start}-${start + 3} (${rs.length} measurements): ${parts.join('; ')}${abnormal}`;
  }).join('\n');
}
