import { describe, expect, it } from 'vitest';
import { foodHistory, growthHistory, sleepHistory } from './historyDigest';
import type { AppState, FoodEntry, SleepEntry } from '../types';

const state = (food: FoodEntry[], sleep: SleepEntry[] = []) =>
  ({ babyProfile: { birthDate: '2026-01-01', gender: 'girl' }, foodEntries: food, sleepEntries: sleep }) as unknown as AppState;
const today = new Date('2026-06-01'); // baby is week 21
const day = (n: number) => new Date(Date.UTC(2026, 0, 1 + n)).toISOString().slice(0, 10);

describe('history digest', () => {
  it('summarizes older food days and marks abnormal ones', () => {
    // days 10..30 (weeks 1-4, older than 8 weeks back -> one 4-week line, weeks 0-3 and 4-7)
    const food: FoodEntry[] = [];
    for (let n = 10; n < 30; n++) food.push({ id: day(n), date: day(n), momMl: 700, poop: { times: 2, colors: ['yellow'] } });
    food[3] = { ...food[3], momMl: 200 }; // low milk
    food[5] = { ...food[5], allergy: ['rash'], poop: { times: 1, colors: ['red'] } };
    for (let n = 120; n < 125; n++) food.push({ id: day(n), date: day(n), momMl: 800 }); // recent-ish, stays out (newest 7 are raw)
    const out = foodHistory(state(food), today);
    expect(out).toContain('milk');
    expect(out).toContain('ABNORMAL');
    expect(out).toContain('reaction: rash');
    expect(out).toContain('red poop');
    expect(out).toContain('milk 200 ml (usual 700 ml)');
  });

  it('is empty when there is nothing older than the recent days', () => {
    expect(foodHistory(state([{ id: 'a', date: day(150), momMl: 100 }]), today)).toBe('');
  });

  it('flags a bad night and a short sleep day', () => {
    const sleep: SleepEntry[] = [];
    for (let n = 10; n < 20; n++) sleep.push({ id: `n${n}`, date: day(n), kind: 'night', start: '20:00', end: '06:00', wakeUps: 1 });
    sleep[2] = { ...sleep[2], end: '22:00', wakeUps: 5 };
    const out = sleepHistory(state([], sleep), today);
    expect(out).toContain('woke 5x at night');
    expect(out).toContain('total sleep 2h (usual 10h)');
  });
});

describe('growth history', () => {
  it('summarizes old measurements and marks a weight drop, keeps the newest out', () => {
    const g = (n: number, weight: number) => ({ id: day(n), date: day(n), weight });
    const entries = [g(7, 4.0), g(14, 4.3), g(21, 4.1), g(28, 4.6), g(60, 5.5), g(90, 6.0), g(120, 6.5), g(150, 7.0)];
    const s = { ...state([]), growthEntries: entries } as unknown as AppState;
    const out = growthHistory(s);
    expect(out).toContain('weeks 0-3');
    expect(out).toContain('weight down 0.2 kg');
    expect(out).not.toContain('7 kg'); // newest 4 are not in the summary
  });

  it('is empty with 4 or fewer measurements', () => {
    const s = { ...state([]), growthEntries: [{ id: 'a', date: day(30), weight: 4 }] } as unknown as AppState;
    expect(growthHistory(s)).toBe('');
  });
});
