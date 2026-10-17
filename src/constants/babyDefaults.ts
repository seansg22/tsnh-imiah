import type { BabyProfile, FeedingMethod, FeedingWay, MilkType } from '../types';

// Default Estimated Due Date (EDD) used until the user sets one in Settings.
// Wonder Weeks leaps are calculated from EDD, not birth date, since
// developmental leap timing tracks gestational age rather than chronological
// age since birth.
export const DEFAULT_EDD = '2026-05-01';

// Profiles saved before the milk/way split only have the single `feedingMethod`.
export function getFeeding(p: BabyProfile): { milk: MilkType[]; ways: FeedingWay[]; other: string; milkNotes: string } {
  if (p.milkTypes?.length) return { milk: p.milkTypes, ways: p.feedingWays ?? [], other: p.feedingWayOther ?? '', milkNotes: p.milkNotes ?? '' };
  const m = p.feedingMethod ?? 'breast';
  return { milk: [m === 'formula' ? 'formula' : 'mom'], ways: [m === 'breast' ? 'direct' : 'bottle'], other: '', milkNotes: '' };
}

// Value for the legacy `feedingMethod` field, so older app versions keep working.
export const toLegacyMethod = (milk: MilkType[], ways: FeedingWay[]): FeedingMethod =>
  milk.includes('formula') ? 'formula' : ways.includes('bottle') && !ways.includes('direct') ? 'bottle' : 'breast';
