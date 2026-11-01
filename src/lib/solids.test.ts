import { describe, expect, it } from 'vitest';
import { solidsOf } from './solids';
import type { FoodEntry } from '../types';

const base = { id: '2026-10-01', date: '2026-10-01' };

describe('solidsOf (old entries -> solids)', () => {
  it('turns the old foods/portion fields into one solid', () => {
    const old: FoodEntry = { ...base, foods: ['fish', 'rice'], solidTimes: 2, portion: 'half' };
    expect(solidsOf(old)).toEqual([{ foods: ['fish', 'rice'], portion: 'half' }]);
  });

  it('keeps an old grams portion as it was saved', () => {
    expect(solidsOf({ ...base, foods: ['banana'], portion: '50 g' })).toEqual([{ foods: ['banana'], portion: '50 g' }]);
  });

  it('leaves out portion when the old entry had none', () => {
    expect(solidsOf({ ...base, foods: ['banana'] })).toEqual([{ foods: ['banana'] }]);
  });

  it('gives no solids for an entry without foods', () => {
    expect(solidsOf({ ...base, momTimes: 3 })).toEqual([]);
    expect(solidsOf({ ...base, foods: [] })).toEqual([]);
  });

  it('prefers the new solids when an entry has both', () => {
    const both: FoodEntry = { ...base, foods: ['x'], solids: [{ foods: ['y'], snack: true }] };
    expect(solidsOf(both)).toEqual([{ foods: ['y'], snack: true }]);
  });
});
