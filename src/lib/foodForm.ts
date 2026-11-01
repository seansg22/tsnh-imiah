import type { MilkFields, SolidMeal } from '../types';

export type MilkKind = 'mom' | 'formula' | 'mix';
export type MilkState = MilkFields & { kind?: MilkKind };

export const hasMomData = (m?: MilkFields) => m?.momTimes !== undefined || m?.momMl !== undefined || !!m?.momWays?.length;
export const hasFormulaData = (m?: MilkFields) => m?.formulaTimes !== undefined || m?.formulaMl !== undefined;

export function milkSeed(m?: MilkFields): MilkState {
  const mom = hasMomData(m);
  const formula = hasFormulaData(m);
  // no history yet: start on mom's milk
  return { ...m, kind: !m ? 'mom' : mom && formula ? 'mix' : mom ? 'mom' : formula ? 'formula' : undefined };
}

// only the fields of the chosen type are saved
export function milkOut(s: MilkState): MilkFields {
  const mom = s.kind === 'mom' || s.kind === 'mix';
  const formula = s.kind === 'formula' || s.kind === 'mix';
  return {
    ...(mom && s.momTimes !== undefined ? { momTimes: s.momTimes } : {}),
    ...(mom && s.momMl !== undefined ? { momMl: s.momMl } : {}),
    ...(mom && s.momWays?.length ? { momWays: s.momWays } : {}),
    ...(formula && s.formulaTimes !== undefined ? { formulaTimes: s.formulaTimes } : {}),
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
