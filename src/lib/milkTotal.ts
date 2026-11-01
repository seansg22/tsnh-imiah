import type { FoodEntry, MilkFields } from '../types';
import { dayMilksOf } from './dayMilks';

export interface MilkTotal {
  ml: number; // sum of times x ml over mom's milk and formula
  feeds: number; // all feeds
  complete: boolean; // false when some feeds have no ml, so ml is a minimum
}

function sum(parts: MilkFields[]): MilkTotal {
  const total: MilkTotal = { ml: 0, feeds: 0, complete: true };
  const add = (times?: number, ml?: number) => {
    if (times === undefined) return;
    total.feeds += times;
    if (ml === undefined) total.complete = false;
    else total.ml += times * ml;
  };
  for (const m of parts) {
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
