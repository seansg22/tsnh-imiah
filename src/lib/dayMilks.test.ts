import { describe, expect, it } from 'vitest';
import { dayMilksOf, splitDayMilks } from './dayMilks';
import { milkTotals } from './milkTotal';
import { milkOut, milkSeed } from './foodForm';
import { foodData } from './advicePrompts';
import type { AppState, FoodEntry } from '../types';

const base = { id: '2026-10-01', date: '2026-10-01' };

describe('dayMilksOf (old entries keep working)', () => {
  it('an old entry is one daytime record', () => {
    const old: FoodEntry = { ...base, momTimes: 3, momMl: 60, formulaTimes: 2, formulaMl: 90, foods: ['rice'] };
    expect(dayMilksOf(old)).toEqual([{ momTimes: 3, momMl: 60, formulaTimes: 2, formulaMl: 90 }]);
  });

  it('an entry without daytime milk has no records, even with night milk or solids', () => {
    expect(dayMilksOf({ ...base, foods: ['rice'] })).toEqual([]);
    expect(dayMilksOf({ ...base, night: { momTimes: 1 } })).toEqual([]);
  });

  it('new entries add more records after the first', () => {
    const e: FoodEntry = { ...base, momTimes: 3, moreMilks: [{ formulaTimes: 1, formulaMl: 120 }, {}] };
    expect(dayMilksOf(e)).toEqual([{ momTimes: 3 }, { formulaTimes: 1, formulaMl: 120 }]); // empty records dropped
  });
});

describe('splitDayMilks (saving)', () => {
  it('puts the first record on the entry, so an older app version still shows it', () => {
    const saved = splitDayMilks([{ momTimes: 3, momMl: 60 }, { formulaTimes: 1, formulaMl: 120 }]);
    expect(saved).toEqual({ momTimes: 3, momMl: 60, moreMilks: [{ formulaTimes: 1, formulaMl: 120 }] });
  });

  it('one record has no moreMilks, exactly the old shape', () => {
    expect(splitDayMilks([{ momTimes: 3 }])).toEqual({ momTimes: 3 });
  });

  it('removing the first record promotes the next one', () => {
    expect(splitDayMilks([{}, { formulaTimes: 2 }])).toEqual({ formulaTimes: 2 });
  });

  it('nothing to save gives nothing', () => {
    expect(splitDayMilks([])).toEqual({});
  });
});

describe('editing keeps every record', () => {
  it('old entry: seed then save keeps the same total (times x ml folds into ml)', () => {
    const old: FoodEntry = { ...base, momTimes: 3, momMl: 60, formulaTimes: 2 };
    const saved = splitDayMilks(dayMilksOf(old).map(milkSeed).map(milkOut));
    expect(saved).toEqual({ momMl: 180, formulaTimes: 2 });
  });

  it('several records survive seed then save', () => {
    const e: FoodEntry = { ...base, momTimes: 3, moreMilks: [{ formulaTimes: 1, formulaMl: 120 }] };
    const saved = splitDayMilks(dayMilksOf(e).map(milkSeed).map(milkOut));
    expect(saved).toEqual({ momTimes: 3, moreMilks: [{ formulaMl: 120 }] });
  });
});

describe('totals and AI data count every daytime record', () => {
  const e: FoodEntry = { ...base, momTimes: 2, momMl: 60, moreMilks: [{ formulaTimes: 1, formulaMl: 120 }], night: { momTimes: 1, momMl: 100 } };

  it('adds all daytime records, then night', () => {
    const t = milkTotals(e);
    expect(t.day).toEqual({ ml: 240, complete: true });
    expect(t.night.ml).toBe(100);
    expect(t.all.ml).toBe(340);
  });

  it('is sent to the AI', () => {
    const out = foodData({ foodEntries: [e], sleepEntries: [] } as unknown as AppState);
    expect(out).toContain("daytime mom's milk 120 ml");
    expect(out).toContain('daytime formula 120 ml');
    expect(out).toContain('total milk 340 ml');
  });
});
