import { describe, expect, it } from 'vitest';
import { emptySolid, hasFoods, milkOut, milkSeed, solidOut, solidSeed, withValue } from './foodForm';
import { solidsOf } from './solids';
import type { FoodEntry } from '../types';

const base = { id: '2026-10-01', date: '2026-10-01' };

describe('milkSeed', () => {
  it('starts on mom milk when there is no history', () => {
    expect(milkSeed(undefined).kind).toBe('mom');
  });

  it('picks the kind from what an old entry saved', () => {
    expect(milkSeed({ momTimes: 3 }).kind).toBe('mom');
    expect(milkSeed({ formulaTimes: 2, formulaMl: 80 }).kind).toBe('formula');
    expect(milkSeed({ momTimes: 3, formulaTimes: 2 }).kind).toBe('mix');
  });

  it('has no kind for an entry with no milk (solids only)', () => {
    expect(milkSeed({}).kind).toBeUndefined();
  });
});

describe('milkOut', () => {
  const all = { momTimes: 3, momMl: 60, momWays: ['breast' as const], formulaTimes: 2, formulaMl: 80 };

  it('only keeps the fields of the chosen kind', () => {
    expect(milkOut({ ...all, kind: 'mom' })).toEqual({ momTimes: 3, momMl: 60, momWays: ['breast'] });
    expect(milkOut({ ...all, kind: 'formula' })).toEqual({ formulaTimes: 2, formulaMl: 80 });
    expect(milkOut({ ...all, kind: 'mix' })).toEqual(all);
  });

  it('saves nothing when no kind is picked or nothing is filled', () => {
    expect(milkOut({ ...all, kind: undefined })).toEqual({});
    expect(milkOut({ kind: 'mom' })).toEqual({});
  });
});

describe('editing an old entry loses nothing', () => {
  const old: FoodEntry = {
    ...base,
    momTimes: 5,
    formulaTimes: 2,
    formulaMl: 90,
    foods: ['fish', 'rice'],
    solidTimes: 2,
    portion: '1/2 bowl',
    allergy: ['cough'],
  };

  it('milk goes through form seed and output unchanged', () => {
    expect(milkOut(milkSeed(old))).toEqual({ momTimes: 5, formulaTimes: 2, formulaMl: 90 });
  });

  it('the solid and its old portion survive', () => {
    const saved = solidsOf(old).map(solidSeed).map(solidOut);
    expect(saved).toEqual([{ foods: ['fish', 'rice'], portion: '1/2 bowl' }]);
  });

  it('an old grams portion also survives', () => {
    const saved = solidsOf({ ...base, foods: ['pear'], portion: '50 g' }).map(solidSeed).map(solidOut);
    expect(saved[0].portion).toBe('50 g');
  });
});

describe('solid drafts', () => {
  it('adds the typed food that was not added yet, trimmed', () => {
    expect(solidOut({ ...emptySolid(), foods: ['rice'], other: '  tofu ' })).toEqual({ foods: ['rice', 'tofu'] });
  });

  it('keeps the snack flag and ml portion', () => {
    expect(solidOut({ foods: ['banana'], other: '', portion: '40 ml', snack: true })).toEqual({ foods: ['banana'], portion: '40 ml', snack: true });
  });

  it('knows when a draft has a food', () => {
    expect(hasFoods(emptySolid())).toBe(false);
    expect(hasFoods({ ...emptySolid(), other: 'tofu' })).toBe(true);
    expect(hasFoods({ ...emptySolid(), foods: ['rice'] })).toBe(true);
  });
});

describe('withValue', () => {
  it('adds an older saved value that is not a step, in order', () => {
    expect(withValue([10, 20, 30], 25)).toEqual([10, 20, 25, 30]);
  });

  it('leaves the steps alone when the value is one of them or empty', () => {
    expect(withValue([10, 20], 20)).toEqual([10, 20]);
    expect(withValue([10, 20], undefined)).toEqual([10, 20]);
  });
});
