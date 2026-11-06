import { describe, expect, it } from 'vitest';
import { milkTotals } from './milkTotal';

const base = { id: '2026-10-01', date: '2026-10-01' };

describe('milkTotals', () => {
  it('gives day, night and the whole day (old entries: times x ml, new ones: ml)', () => {
    const t = milkTotals({ ...base, momTimes: 3, momMl: 60, formulaTimes: 2, formulaMl: 90, night: { momTimes: 1, momMl: 100 } });
    expect(t.day).toEqual({ ml: 360, complete: true });
    expect(t.night).toEqual({ ml: 100, complete: true });
    expect(t.all).toEqual({ ml: 460, complete: true });
  });

  it('is a minimum when an old entry has times but no ml', () => {
    const t = milkTotals({ ...base, momTimes: 4, formulaTimes: 2, formulaMl: 90 });
    expect(t.day).toEqual({ ml: 180, complete: false });
    expect(t.all.complete).toBe(false);
  });

  it('is zero for entries without milk', () => {
    const zero = { ml: 0, complete: true };
    expect(milkTotals({ ...base, foods: ['rice'] })).toEqual({ day: zero, night: zero, all: zero });
  });

  it('counts a new record with ml only', () => {
    expect(milkTotals({ ...base, formulaMl: 90, night: { momMl: 100 } }).all).toEqual({ ml: 190, complete: true });
  });
});
