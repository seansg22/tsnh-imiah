import type { Milestone } from '../types';

// overdue = the expected window passed and it is neither achieved nor skipped.
// Overdue ones drive the banner, the nav badge and the AI advice, so a skipped one stays quiet.
export function isOverdue(m: Milestone, week: number, achieved: ReadonlySet<string>, skipped: ReadonlySet<string>): boolean {
  return m.weekRange[1] <= week && !achieved.has(m.id) && !skipped.has(m.id);
}

// only vaccinations can be skipped (a family may choose not to give one)
export const canSkip = (m: Milestone) => m.category === 'vaccinationVN' || m.category === 'vaccinationSG';
