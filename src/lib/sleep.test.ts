import { describe, expect, it } from 'vitest';
import { formatDuration, groupByDay, hasNightSleep, sleepMinutes } from './sleep';
import type { SleepEntry } from '../types';

const e = (over: Partial<SleepEntry>): SleepEntry => ({ id: 'x', date: '2026-11-01', kind: 'nap', start: '13:00', end: '14:30', ...over });

describe('sleepMinutes', () => {
  it('counts a same-day sleep', () => {
    expect(sleepMinutes('13:00', '14:30')).toBe(90);
  });

  it('counts a sleep that runs past midnight', () => {
    expect(sleepMinutes('20:30', '06:00')).toBe(9 * 60 + 30);
    expect(sleepMinutes('23:50', '00:10')).toBe(20);
  });

  it('treats an equal start and end as a full day, so the form must block it', () => {
    expect(sleepMinutes('08:00', '08:00')).toBe(24 * 60);
  });
});

describe('formatDuration', () => {
  it('writes hours and minutes without empty parts', () => {
    expect(formatDuration(570)).toBe('9h 30m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(0)).toBe('0m');
  });
});

describe('hasNightSleep', () => {
  const list = [e({ id: 'a', kind: 'night', date: '2026-11-01' }), e({ id: 'b', kind: 'nap', date: '2026-11-02' })];

  it('finds a night sleep on that day only', () => {
    expect(hasNightSleep(list, '2026-11-01')).toBe(true);
    expect(hasNightSleep(list, '2026-11-03')).toBe(false);
  });

  it('does not count naps', () => {
    expect(hasNightSleep(list, '2026-11-02')).toBe(false);
  });

  it('lets the entry being edited keep its own day', () => {
    expect(hasNightSleep(list, '2026-11-01', 'a')).toBe(false);
  });
});

describe('groupByDay', () => {
  it('splits naps from night sleep and adds each up', () => {
    const days = groupByDay([
      e({ id: 'n2', start: '16:00', end: '16:45' }),
      e({ id: 'n1', start: '10:00', end: '11:00' }),
      e({ id: 'ni', kind: 'night', start: '20:00', end: '05:00' }),
    ]);
    expect(days).toHaveLength(1);
    expect(days[0].naps.map(x => x.id)).toEqual(['n1', 'n2']); // earliest first
    expect(days[0].napMin).toBe(60 + 45);
    expect(days[0].nightMin).toBe(9 * 60);
    expect(days[0].totalMin).toBe(105 + 540);
  });

  it('lists the newest date first and keeps dates apart', () => {
    const days = groupByDay([e({ date: '2026-10-30' }), e({ date: '2026-11-01' })]);
    expect(days.map(d => d.date)).toEqual(['2026-11-01', '2026-10-30']);
  });

  it('is empty without entries', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
