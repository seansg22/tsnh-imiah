import { describe, expect, it } from 'vitest';
import { canSkip, isOverdue } from './milestones';
import type { Milestone } from '../types';

const m = (over: Partial<Milestone> = {}): Milestone => ({ id: 'v1', weekRange: [8, 10], label: 'Vaccine', category: 'vaccinationVN', ...over });
const none = new Set<string>();

describe('isOverdue', () => {
  it('is overdue once the window has passed and it is not done', () => {
    expect(isOverdue(m(), 12, none, none)).toBe(true);
    expect(isOverdue(m(), 9, none, none)).toBe(false); // still inside the window
  });

  it('is not overdue when achieved', () => {
    expect(isOverdue(m(), 12, new Set(['v1']), none)).toBe(false);
  });

  it('is not overdue when skipped, so it never triggers the banner or badge', () => {
    expect(isOverdue(m(), 12, none, new Set(['v1']))).toBe(false);
  });
});

describe('canSkip', () => {
  it('only vaccinations can be skipped', () => {
    expect(canSkip(m())).toBe(true);
    expect(canSkip(m({ category: 'vaccinationSG' }))).toBe(true);
    expect(canSkip(m({ category: 'motor' }))).toBe(false);
  });
});
