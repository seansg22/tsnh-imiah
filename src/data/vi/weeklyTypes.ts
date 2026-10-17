import type { SleepNorm, FeedingNorm } from '../../types';

// Vietnamese display text for one week. Ids, icons and week numbers come from the English data.
export interface WeekTr {
  title: string;
  summary: string;
  motor: string[];
  cognitive: string[];
  social: string[];
  sensory: string[];
  activities: { title: string; description: string }[];
  sleep: SleepNorm;
  feeding: FeedingNorm;
  comingUpMilestone: string;
  funFact?: string;
  parentTip?: string;
}
