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
  category: 'motor' | 'cognitive' | 'social' | 'sensory' | 'vaccinationVN' | 'vaccinationSG';
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

export interface MilkFields {
  momTimes?: number; // how many times mom fed directly
  momMl?: number; // ml per mom's milk feed
  momWays?: ('breast' | 'bottle')[]; // how mom's milk was given: straight from the breast and/or from a bottle
  formulaTimes?: number; // how many formula feeds
  formulaMl?: number; // ml per formula feed
}

export interface SolidMeal {
  foods: string[]; // chip keys (fd.food.*) or free text
  snack?: boolean; // a snack between main meals (bữa phụ)
  portion?: string; // "50 ml", or older saved text (chip key spoons|quarter|half|whole, "50 g")
}

export interface PoopLog {
  times?: number;
  colors?: string[]; // keys of POOP_COLORS
  textures?: string[]; // POOP_TEXTURES
}

export interface FoodEntry extends MilkFields { // the milk fields are the daytime milk
  night?: MilkFields; // night-time milk
  poop?: PoopLog;
  id: string; // same as date: one note per day
  date: string; // "YYYY-MM-DD"
  solids?: SolidMeal[]; // one item per solid meal that day
  foods?: string[]; // older entries: one solid meal, see solidsOf()
  solidTimes?: number; // older entries only
  allergy?: string[]; // reactions noticed that day: chip keys (fd.allergy.*) or free text
  portion?: string; // older entries only
}

export type SleepKind = 'nap' | 'night';

// one sleep: a daytime nap or the night sleep. A day can have many naps.
export interface SleepEntry {
  id: string;
  date: string; // "YYYY-MM-DD", the day the sleep started
  kind: SleepKind;
  start: string; // "HH:mm"
  end: string; // "HH:mm", may be after midnight for night sleep
  fallAsleepMin?: number; // how long it took baby to fall asleep
  wakeUps?: number; // night sleep only
  wakeFeed?: boolean; // night sleep only: baby fed when waking up
  wakeFeedMin?: number; // how long that feed took
  fellAsleep?: string[]; // keys of SLEEP_WAYS
}

export type Page = 'onboarding' | 'today' | 'milestones' | 'insights' | 'growth' | 'settings' | 'ai' | 'wonderweek' | 'babyprofile' | 'food' | 'mom' | 'fooddiary' | 'sleep';

export interface AppState {
  babyProfile: BabyProfile | null;
  achievedMilestones: string[];
  skippedMilestones: string[]; // vaccinations the family chose to skip: never overdue
  selectedWeek: number;
  growthEntries: GrowthEntry[];
  foodEntries: FoodEntry[];
  sleepEntries: SleepEntry[];
  knowledgeBase: KnowledgeEntry[];
  currentPage: Page;
}

export type AppAction =
  | { type: 'SET_BABY_PROFILE'; payload: BabyProfile }
  | { type: 'TOGGLE_MILESTONE'; payload: string }
  | { type: 'TOGGLE_SKIP_MILESTONE'; payload: string }
  | { type: 'SET_SELECTED_WEEK'; payload: number }
  | { type: 'ADD_GROWTH_ENTRY'; payload: GrowthEntry }
  | { type: 'UPDATE_GROWTH_ENTRY'; payload: GrowthEntry }
  | { type: 'DELETE_GROWTH_ENTRY'; payload: string }
  | { type: 'UPSERT_FOOD_ENTRY'; payload: FoodEntry }
  | { type: 'DELETE_FOOD_ENTRY'; payload: string }
  | { type: 'UPSERT_SLEEP_ENTRY'; payload: SleepEntry }
  | { type: 'DELETE_SLEEP_ENTRY'; payload: string }
  | { type: 'ADD_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'UPDATE_KNOWLEDGE_ENTRY'; payload: KnowledgeEntry }
  | { type: 'DELETE_KNOWLEDGE_ENTRY'; payload: string }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'HYDRATE' };
