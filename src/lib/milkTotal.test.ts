import { describe, expect, it } from 'vitest';
import { milkTotals } from './milkTotal';

const base = { id: '2026-10-01', date: '2026-10-01' };

describe('milkTotals', () => {
  it('gives day, night and the whole day (times x ml, mom milk + formula)', () => {
    const t = milkTotals({ ...base, momTimes: 3, momMl: 60, formulaTimes: 2, formulaMl: 90, night: { momTimes: 1, momMl: 100 } });
    expect(t.day).toEqual({ ml: 360, feeds: 5, complete: true });
    expect(t.night).toEqual({ ml: 100, feeds: 1, complete: true });
    expect(t.all).toEqual({ ml: 460, feeds: 6, complete: true });
  });

  it('is a minimum when some feeds have no ml', () => {
    const t = milkTotals({ ...base, momTimes: 4, formulaTimes: 2, formulaMl: 90 });
    expect(t.day).toEqual({ ml: 180, feeds: 6, complete: false });
    expect(t.all.complete).toBe(false);
  });

  it('is zero for old entries without milk or without times', () => {
    const zero = { ml: 0, feeds: 0, complete: true };
    expect(milkTotals({ ...base, foods: ['rice'] })).toEqual({ day: zero, night: zero, all: zero });
    expect(milkTotals({ ...base, formulaMl: 90 }).all).toEqual(zero);
  });
});
