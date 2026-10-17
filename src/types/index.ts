export type FeedingMethod = 'breast' | 'bottle' | 'formula';
export type MilkType = 'mom' | 'formula';
export type FeedingWay = 'direct' | 'bottle';

export interface BabyProfile {
  name: string;
  birthDate: string; // ISO "YYYY-MM-DD"
  gender: 'girl' | 'boy';
  feedingMethod?: FeedingMethod; // legacy single choice; still written (derived) so older clients can read it
  milkTypes?: MilkType[]; // what baby drinks (multi-select); read via getFeeding(), which falls back to feedingMethod
  milkNotes?: string; // free text on how the different milks are rotated; only kept when 2+ milkTypes
  feedingWays?: FeedingWay[]; // how baby is fed (multi-select)
  feedingWayOther?: string; // free text for any other way
  edd?: string; // ISO "YYYY-MM-DD" — estimated due date, used to calculate Wonder Weeks
  solidsStartDate?: string; // ISO "YYYY-MM-DD" — when baby started solids/weaning; unset = not started yet
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

export interface FoodEntry {
  id: string; // same as date: one note per day
  date: string; // "YYYY-MM-DD"
  momTimes?: number; // how many times mom fed directly that day
  formulaTimes?: number; // how many formula feeds that day
  formulaMl?: number; // ml per feed
  foods?: string[]; // chip keys (fd.food.*) or free text
  solidTimes?: number; // how many solid meals that day
  allergy?: string[]; // reactions noticed that day: chip keys (fd.allergy.*) or free text
  portion?: string; // chip key (spoons|quarter|half|whole) or free text
}

export type Page = 'onboarding' | 'today' | 'milestones' | 'insights' | 'growth' | 'settings' | 'ai' | 'wonderweek' | 'babyprofile' | 'food' | 'mom' | 'fooddiary';

export interface AppState {
  babyProfile: BabyProfile | null;
  achievedMilestones: string[];
  selectedWeek: number;
  growthEntries: GrowthEntry[];
  foodEntries: FoodEntry[];
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
  | { type: 'UPSERT_FOOD_ENTRY'; payload: FoodEntry }
  | { type: 'DELETE_FOOD_ENTRY'; payload: string }
  | { type: 'ADD_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'UPDATE_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'DELETE_KNOWLEDGE_ENTRY'; payload: string }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'HYDRATE' };
