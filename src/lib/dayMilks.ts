import type { FoodEntry, MilkFields } from '../types';
import { hasFormulaData, hasMomData } from './foodForm';

const pickMilk = (m: MilkFields): MilkFields => ({
  ...(m.momTimes !== undefined ? { momTimes: m.momTimes } : {}),
  ...(m.momMl !== undefined ? { momMl: m.momMl } : {}),
  ...(m.momWays?.length ? { momWays: m.momWays } : {}),
  ...(m.formulaTimes !== undefined ? { formulaTimes: m.formulaTimes } : {}),
  ...(m.formulaMl !== undefined ? { formulaMl: m.formulaMl } : {}),
});

// Daytime milk records of a day. The first one lives on the entry itself (this is what every
// older entry has, and older app versions still read it), the others are in moreMilks.
export function dayMilksOf(e: FoodEntry): MilkFields[] {
  return [pickMilk(e), ...(e.moreMilks ?? [])].filter(m => hasMomData(m) || hasFormulaData(m));
}

// the other way, for saving: first record onto the entry, the rest into moreMilks
export function splitDayMilks(records: MilkFields[]): Pick<FoodEntry, 'moreMilks'> & MilkFields {
  const filled = records.filter(m => Object.keys(m).length > 0);
  const [first = {}, ...rest] = filled;
  return { ...first, ...(rest.length ? { moreMilks: rest } : {}) };
}
