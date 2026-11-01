import { describe, expect, it } from 'vitest';
import { foodData, sleepData } from './advicePrompts';
import type { AppState, FoodEntry, SleepEntry } from '../types';

const stateWith = (food: FoodEntry[], sleep: SleepEntry[] = []) => ({ foodEntries: food, sleepEntries: sleep }) as unknown as AppState;

describe('food diary sent to the AI', () => {
  it('includes an old entry (foods, portion, milk times)', () => {
    const out = foodData(stateWith([{ id: 'a', date: '2026-10-01', momTimes: 5, formulaTimes: 2, formulaMl: 90, foods: ['fish'], portion: 'half' }]));
    expect(out).toContain('2026-10-01');
    expect(out).toContain("daytime mom's milk 5x");
    expect(out).toContain('solid 1: fish (half)');
    expect(out).toContain('total milk 180+ ml'); // mom feeds have no ml, so it is a minimum
  });

  it('includes the new parts: night milk, snack, poop, how mom milk was given', () => {
    const out = foodData(stateWith([{
      id: 'b', date: '2026-11-01', momTimes: 3, momMl: 60, momWays: ['breast', 'bottle'],
      night: { momTimes: 1, momMl: 100 },
      solids: [{ foods: ['banana'], portion: '40 ml', snack: true }],
      poop: { times: 2, colors: ['yellow'], textures: ['soft'] },
    }]));
    expect(out).toContain("night mom's milk 1x of 100 ml");
    expect(out).toContain('breastfed + from bottle');
    expect(out).toContain('snack 1: banana (40 ml)');
    expect(out).toContain('poop 2x, yellow, soft');
    expect(out).toContain('total milk 280 ml (daytime 180, night 100)');
  });
});

describe('sleep diary sent to the AI', () => {
  it('splits naps and night sleep with details', () => {
    const out = sleepData(stateWith([], [
      { id: 'n', date: '2026-11-01', kind: 'nap', start: '13:00', end: '14:30', fallAsleepMin: 10, fellAsleep: ['rocked'] },
      { id: 'g', date: '2026-11-01', kind: 'night', start: '20:00', end: '06:00', wakeUps: 2, wakeFeed: true, wakeFeedMin: 15 },
    ]));
    expect(out).toContain('naps 1h 30m: 13:00-14:30 (1h 30m), took 10 min to fall asleep, fell asleep: rocked');
    expect(out).toContain('night 10h: 20:00-06:00 (10h), woke 2x, fed when waking for 15 min');
    expect(out).toContain('total 11h 30m');
  });

  it('says so when there is nothing yet', () => {
    expect(sleepData(stateWith([]))).toBe('No sleep entries yet.');
  });
});
