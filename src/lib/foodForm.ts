import type { MilkFields, SolidMeal } from '../types';

export type MilkKind = 'mom' | 'formula' | 'mix';
export type MilkState = MilkFields & { kind?: MilkKind };

export const hasMomData = (m?: MilkFields) => m?.momTimes !== undefined || m?.momMl !== undefined || !!m?.momWays?.length;
export const hasFormulaData = (m?: MilkFields) => m?.formulaTimes !== undefined || m?.formulaMl !== undefined;

// "times" is gone from the form. An old "3 x 60 ml" now reads as 180 ml (same total).
// Times with no ml stay as they are, so nothing the user saved is lost.
export function foldTimes(m: MilkFields): MilkFields {
  const { momTimes, momMl, formulaTimes, formulaMl, ...rest } = m;
  return {
    ...rest,
    ...(momMl !== undefined ? { momMl: momMl * (momTimes ?? 1) } : momTimes !== undefined ? { momTimes } : {}),
    ...(formulaMl !== undefined ? { formulaMl: formulaMl * (formulaTimes ?? 1) } : formulaTimes !== undefined ? { formulaTimes } : {}),
  };
}

export function milkSeed(raw?: MilkFields): MilkState {
  const m = raw && foldTimes(raw);
  const mom = hasMomData(m);
  const formula = hasFormulaData(m);
  // no history yet: start on mom's milk
  return { ...m, kind: !m ? 'mom' : mom && formula ? 'mix' : mom ? 'mom' : formula ? 'formula' : undefined };
}

// an extra daytime milk record starts on mom's milk
export const newMilkRecord = (): MilkState => ({ kind: 'mom' });

// only the fields of the chosen type are saved
export function milkOut(s: MilkState): MilkFields {
  const mom = s.kind === 'mom' || s.kind === 'mix';
  const formula = s.kind === 'formula' || s.kind === 'mix';
  return {
    ...(mom && s.momTimes !== undefined && s.momMl === undefined ? { momTimes: s.momTimes } : {}), // old times: only kept while there is no ml
    ...(mom && s.momMl !== undefined ? { momMl: s.momMl } : {}),
    ...(mom && s.momWays?.length ? { momWays: s.momWays } : {}),
    ...(formula && s.formulaTimes !== undefined && s.formulaMl === undefined ? { formulaTimes: s.formulaTimes } : {}),
    ...(formula && s.formulaMl !== undefined ? { formulaMl: s.formulaMl } : {}),
  };
}

// keep an older saved value outside the usual steps selectable
export const withValue = (steps: number[], v?: number) => (v !== undefined && !steps.includes(v) ? [...steps, v].sort((x, y) => x - y) : steps);

export interface SolidDraft { foods: string[]; other: string; portion: string; snack: boolean }
export const emptySolid = (): SolidDraft => ({ foods: [], other: '', portion: '', snack: false });
export const solidSeed = (m: SolidMeal): SolidDraft => ({ foods: m.foods, other: '', portion: m.portion ?? '', snack: !!m.snack });
export const solidOut = (d: SolidDraft): SolidMeal => ({
  foods: [...d.foods, ...(d.other.trim() ? [d.other.trim()] : [])],
  ...(d.portion.trim() ? { portion: d.portion.trim() } : {}),
  ...(d.snack ? { snack: true } : {}),
});
export const hasFoods = (d: SolidDraft) => d.foods.length > 0 || d.other.trim() !== '';
