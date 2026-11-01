import type { FoodEntry, MilkFields } from '../types';

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

// one milk section (used while typing)
export const milkSum = (m: MilkFields): MilkTotal => sum([m]);

// daytime milk is the entry itself, night milk is entry.night
export function milkTotals(e: FoodEntry): { day: MilkTotal; night: MilkTotal; all: MilkTotal } {
  const night = e.night ?? {};
  return { day: sum([e]), night: sum([night]), all: sum([e, night]) };
}
