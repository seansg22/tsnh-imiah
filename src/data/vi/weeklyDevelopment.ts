import type { WeekData, Milestone } from '../../types';
import { weeklyData as enWeekly, milestones as enMilestones } from '../weeklyDevelopment';
import type { WeekTr } from './weeklyTypes';
import { weeklyA } from './weeklyA';
import { weeklyB } from './weeklyB';
import { weeklyC } from './weeklyC';
import { milestonesTr } from './milestonesTr';

const trByWeek: Record<number, WeekTr> = { ...weeklyA, ...weeklyB, ...weeklyC };

// Same shape and ids as the English data, with Vietnamese display text
export const weeklyData: WeekData[] = enWeekly.map(en => {
  const tr = trByWeek[en.week];
  if (!tr) return en;
  return {
    ...en,
    ...tr,
    activities: en.activities.map((a, i) => ({ ...a, ...tr.activities[i] })),
  };
});

export const milestones: Milestone[] = enMilestones.map(m => {
  const tr = milestonesTr[m.id];
  return tr ? { ...m, label: tr.label, description: tr.description } : m;
});

const weekMap = new Map(weeklyData.map(w => [w.week, w]));

export const definedWeeks: number[] = [...weekMap.keys()].sort((a, b) => a - b);

export function getWeekData(week: number): WeekData {
  const clamped = Math.min(week, 156);
  if (weekMap.has(clamped)) return weekMap.get(clamped)!;
  for (let w = clamped - 1; w >= 0; w--) {
    if (weekMap.has(w)) return weekMap.get(w)!;
  }
  return weeklyData[0];
}
