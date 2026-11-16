import type { FoodEntry, MilkFields } from '../types';
import { dayMilksOf } from './dayMilks';
import { foldTimes } from './foodForm';

export interface MilkTotal {
  ml: number; // sum of ml over mom's milk and formula (old entries: times x ml)
  complete: boolean; // false when an old entry has times but no ml, so ml is a minimum
}

function sum(parts: MilkFields[]): MilkTotal {
  const total: MilkTotal = { ml: 0, complete: true };
  const add = (times?: number, ml?: number) => {
    if (ml !== undefined) total.ml += ml;
    else if (times !== undefined) total.complete = false;
  };
  for (const m of parts.map(foldTimes)) {
    add(m.momTimes, m.momMl);
    add(m.formulaTimes, m.formulaMl);
  }
  return total;
}

// milk section(s) while typing
export const milkSum = (m: MilkFields): MilkTotal => sum([m]);
export const milkSumAll = (ms: MilkFields[]): MilkTotal => sum(ms);

// daytime milk can be several records (dayMilksOf), night milk is entry.night
export function milkTotals(e: FoodEntry): { day: MilkTotal; night: MilkTotal; all: MilkTotal } {
  const day = dayMilksOf(e);
  const night = e.night ?? {};
  return { day: sum(day), night: sum([night]), all: sum([...day, night]) };
}

// number of feeds (cữ): the times when given, else 1 per mom/formula part that has ml
export function milkFeeds(e: FoodEntry): number {
  return [...dayMilksOf(e), e.night ?? {}].map(foldTimes).reduce(
    (n, m) => n + (m.momTimes ?? (m.momMl !== undefined ? 1 : 0)) + (m.formulaTimes ?? (m.formulaMl !== undefined ? 1 : 0)), 0);
}
