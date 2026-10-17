import type { Lang } from '../i18n/langContext';
import * as enWeekly from './weeklyDevelopment';
import * as viWeekly from './vi/weeklyDevelopment';
import { leaps as enLeaps } from './wonderWeeks';
import { leaps as viLeaps } from './vi/wonderWeeks';
import { getInsightExplanation as enInsight, type InsightCategory } from './insightExplanations';
import { getInsightExplanation as viInsight } from './vi/insightExplanations';
import type { WeekData, Milestone } from '../types';

export const getWeekData = (lang: Lang, week: number): WeekData =>
  (lang === 'vi' ? viWeekly : enWeekly).getWeekData(week);

export const getMilestones = (lang: Lang): Milestone[] =>
  lang === 'vi' ? viWeekly.milestones : enWeekly.milestones;

export const getLeaps = (lang: Lang) => (lang === 'vi' ? viLeaps : enLeaps);

// Item text is always looked up in the English data (stable key), the output is in `lang`
export function getInsightExplanationFor(
  lang: Lang,
  category: InsightCategory,
  index: number,
  week: number,
): string {
  const enItem = enWeekly.getWeekData(week)[category][index] ?? '';
  return (lang === 'vi' ? viInsight : enInsight)({ category, item: enItem, week });
}
