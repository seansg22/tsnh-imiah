export type FeedingMethod = 'breast' | 'bottle' | 'formula';

export interface BabyProfile {
  name: string;
  birthDate: string; // ISO "YYYY-MM-DD"
  gender: 'girl' | 'boy';
  feedingMethod?: FeedingMethod;
  edd?: string; // ISO "YYYY-MM-DD" — estimated due date, used to calculate Wonder Weeks
  solidsStartDate?: string; // ISO "YYYY-MM-DD" — when baby started solids/weaning; unset = not started yet
  formulaSwitchDate?: string; // ISO "YYYY-MM-DD" — when baby switched from breast milk to formula; only relevant when feedingMethod is 'formula'
  notes?: string; // free-text notes from the parent, fed into the Ask AI system prompt
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SleepNorm {
  totalHoursRange: string;
  nightSleepHours: string;
  naps: string;
}

export interface FeedingNorm {
  method: string;
  frequency: string;
  notes: string;
}

export interface WeekData {
  week: number;
  title: string;
  summary: string;
  motor: string[];
  cognitive: string[];
  social: string[];
  sensory: string[];
  activities: Activity[];
  sleep: SleepNorm;
  feeding: FeedingNorm;
  comingUpMilestone: string;
  funFact?: string;
  parentTip?: string;
}

export interface CareTips {
  feeding: string[];
  sleep: string[];
  soothing: string[];   // "Settling" for toddlers, "Wellbeing" for 2y+
  health: string[];
}

export interface Milestone {
  id: string;
  weekRange: [number, number];
  label: string;
  category: 'motor' | 'cognitive' | 'social' | 'sensory' | 'vaccination';
  description?: string;
}

export interface GrowthEntry {
  id: string;
  date: string;    // "YYYY-MM-DD"
  weight?: number; // kg
  length?: number; // cm
  head?: number;   // cm
}

export interface KnowledgeEntry {
  id: string;
  createdAt: string; // ISO datetime — when this entry was generated (i.e. when the chat was cleared)
  content: string;   // Gemini-authored, dated summary of what happened/was discussed in a cleared Ask AI conversation
}

export type Page = 'onboarding' | 'today' | 'milestones' | 'insights' | 'growth' | 'settings' | 'book' | 'ai' | 'wonderweek' | 'babyprofile' | 'food';

export interface AppState {
  babyProfile: BabyProfile | null;
  achievedMilestones: string[];
  selectedWeek: number;
  growthEntries: GrowthEntry[];
  knowledgeBase: KnowledgeEntry[];
  currentPage: Page;
}

export type AppAction =
  | { type: 'SET_BABY_PROFILE'; payload: BabyProfile }
  | { type: 'TOGGLE_MILESTONE'; payload: string }
  | { type: 'SET_SELECTED_WEEK'; payload: number }
  | { type: 'ADD_GROWTH_ENTRY'; payload: GrowthEntry }
  | { type: 'UPDATE_GROWTH_ENTRY'; payload: GrowthEntry }
  | { type: 'DELETE_GROWTH_ENTRY'; payload: string }
  | { type: 'ADD_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'UPDATE_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'DELETE_KNOWLEDGE_ENTRY'; payload: string }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'IMPORT_DATA'; payload: { achievedMilestones: string[]; growthEntries: GrowthEntry[] } };
