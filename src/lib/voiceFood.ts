import type { FoodEntry, MilkFields, PoopLog, SolidMeal } from '../types';
import { solidsOf } from './solids';
import { dayMilksOf, splitDayMilks } from './dayMilks';
import { foldTimes } from './foodForm';
import { ALLERGIES, FOODS, POOP_COLORS, POOP_TEXTURES } from '../components/food/foodOptions';

// what the form can take from a spoken note; every part is optional
export interface VoiceEdit {
  section: 'dayMilks' | 'solids';
  index: number; // position of the record in the saved day, first = 0
  remove?: boolean;
  set?: Partial<SolidMeal> & MilkFields; // only the changed fields
}
export type VoiceSection = 'dayMilks' | 'night' | 'solids' | 'poop' | 'allergy';
const SECTIONS: VoiceSection[] = ['dayMilks', 'night', 'solids', 'poop', 'allergy'];

export interface VoiceFood {
  deleteDay?: boolean; // remove the whole day note
  edits?: VoiceEdit[]; // change or remove one record of a list
  replace?: VoiceSection[]; // sections the speaker is correcting: they overwrite the day instead of adding to it
  date?: string; // "YYYY-MM-DD", the day the note is about; today when not said
  dayMilks?: MilkFields[];
  night?: MilkFields;
  solids?: SolidMeal[];
  poop?: PoopLog;
  allergy?: string[];
}

const RECENT_DAYS = 14;

// the saved days, in the same shape Gemini must answer with, so it can fix one item inside a day
export function recentDaysJson(entries: FoodEntry[], today: string): string {
  const from = new Date(`${today}T00:00:00Z`);
  from.setUTCDate(from.getUTCDate() - RECENT_DAYS);
  const cut = from.toISOString().split('T')[0];
  return JSON.stringify(
    entries.filter(e => e.date >= cut).sort((a, b) => b.date.localeCompare(a.date)).map(e => ({
      date: e.date,
      dayMilks: dayMilksOf(e).map(foldTimes),
      ...(e.night ? { night: foldTimes(e.night) } : {}),
      solids: solidsOf(e),
      ...(e.poop ? { poop: e.poop } : {}),
      ...(e.allergy?.length ? { allergy: e.allergy } : {}),
    })),
  );
}

export const foodVoicePrompt = (today: string, entries: FoodEntry[] = []) => `You turn a short spoken note about a baby into diary data (Vietnamese or English, may have speech-to-text mistakes). The note can be tiny, like only one milk or only poop.
Today is ${today}.
Saved days (last ${RECENT_DAYS}), same shape as your answer: ${recentDaysJson(entries, today)}
Reply with ONE JSON object only, no markdown. Leave out anything not said. Shape:
{
 "date": "YYYY-MM-DD" (only if a day is said, like "hôm qua" = yesterday),
 "dayMilks": [{"momMl": number, "momWays": ["breast"|"bottle"], "formulaMl": number}],
 "night": {same as one dayMilks item},
 "solids": [{"foods": string[], "portion": string, "snack": boolean}],
 "poop": {"times": number, "colors": string[], "textures": string[], "note": string},
 "allergy": string[],
 "replace": string[],
 "deleteDay": boolean,
 "edits": [{"section": "dayMilks"|"solids", "index": number, "set": {only the changed fields of that record}, "remove": boolean}]
}
Rules:
- "replace": list the section names (dayMilks, night, solids, poop, allergy) that the speaker is CORRECTING or overwriting ("sửa lại", "nhầm", "đổi thành", "actually", "should be"). If they are just adding something new, leave "replace" out.
- dayMilks and solids hold ONLY the NEW records to add ("thêm một cữ 500ml" = one item). NEVER copy the saved records into them.
- To change or delete ONE record in dayMilks or solids (for example "bữa thịt kho là bữa phụ", "cữ sữa thứ hai là 80ml", "xóa bữa ăn dặm thứ 2"), use "edits" with the index of that record in the saved day (first = 0). "set" holds ONLY the changed fields. "remove": true deletes the record. Do NOT use "replace" for this, the other records stay as they are.
- For night, poop and allergy, a fix goes in "replace" with the COMPLETE corrected section (copy it from the saved day, change what was said).
- To DELETE a part ("xóa", "bỏ", "remove", "clear"), put its section name in "replace" and give it an empty value ([] for lists, {} for objects).
- To delete a WHOLE day ("xóa ngày 2 tháng 11", "xóa cả ngày"), answer only {"date": ..., "deleteDay": true}. Do not list every section in "replace".
- A note can be tiny (one section) or a whole day (all sections).
- One dayMilks item per separate daytime milk feed. Night milk goes in "night". Amounts are in ml.
- momMl = mom's milk, formulaMl = formula milk. momWays: breast (direct) and/or bottle.
- solids: one item per meal. snack = true for a snack (bữa phụ). portion is free text like "50 ml" or "2 muỗng".
- foods: use these keys when the food matches: ${FOODS.join(', ')}. Otherwise write the food in the user's language.
- poop colors only: ${Object.keys(POOP_COLORS).join(', ')}. textures only: ${POOP_TEXTURES.join(', ')}.
- allergy: use these keys when they match: ${ALLERGIES.join(', ')}. Otherwise free text.
- Ignore clock times, the diary has no time field.`;

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim()) : []);
const only = <T extends string>(v: unknown, allowed: readonly T[]) => strs(v).filter((x): x is T => (allowed as readonly string[]).includes(x));

function milk(v: unknown): MilkFields {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const momMl = num(o.momMl);
  const formulaMl = num(o.formulaMl);
  const momWays = only(o.momWays, ['breast', 'bottle'] as const);
  return { ...(momMl ? { momMl } : {}), ...(momMl && momWays.length ? { momWays } : {}), ...(formulaMl ? { formulaMl } : {}) };
}

// Gemini text -> safe form data. null if it is not usable JSON or has nothing in it.
export function parseVoiceFood(text: string): VoiceFood | null {
  let o: Record<string, unknown>;
  try {
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1); // drops ``` fences and chatter
    o = JSON.parse(json);
  } catch {
    return null;
  }
  const out: VoiceFood = {};
  if (typeof o.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.date)) out.date = o.date;
  const dayMilks = (Array.isArray(o.dayMilks) ? o.dayMilks : []).map(milk).filter(m => Object.keys(m).length);
  if (dayMilks.length) out.dayMilks = dayMilks;
  const night = milk(o.night);
  if (Object.keys(night).length) out.night = night;
  const solids = (Array.isArray(o.solids) ? o.solids : []).flatMap((s): SolidMeal[] => {
    const r = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    const foods = strs(r.foods);
    const portion = typeof r.portion === 'string' ? r.portion.trim() : '';
    return foods.length ? [{ foods, ...(portion ? { portion } : {}), ...(r.snack === true ? { snack: true } : {}) }] : [];
  });
  if (solids.length) out.solids = solids;
  const p = (o.poop && typeof o.poop === 'object' ? o.poop : {}) as Record<string, unknown>;
  const times = num(p.times);
  const colors = only(p.colors, Object.keys(POOP_COLORS) as (keyof typeof POOP_COLORS)[]);
  const textures = only(p.textures, POOP_TEXTURES);
  const note = typeof p.note === 'string' ? p.note.trim() : '';
  if (times || colors.length || textures.length || note) {
    out.poop = { ...(times ? { times } : {}), ...(colors.length ? { colors } : {}), ...(textures.length ? { textures } : {}), ...(note ? { note } : {}) };
  }
  const edits = (Array.isArray(o.edits) ? o.edits : []).flatMap((x): VoiceEdit[] => {
    const e = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
    const s = (e.set && typeof e.set === 'object' ? e.set : {}) as Record<string, unknown>;
    if ((e.section !== 'dayMilks' && e.section !== 'solids') || !Number.isInteger(e.index) || (e.index as number) < 0) return [];
    const set: VoiceEdit['set'] = {};
    const momMl = num(s.momMl), formulaMl = num(s.formulaMl), ways = only(s.momWays, ['breast', 'bottle'] as const), foods = strs(s.foods);
    if (momMl) set.momMl = momMl;
    if (formulaMl) set.formulaMl = formulaMl;
    if (ways.length) set.momWays = ways;
    if (foods.length) set.foods = foods;
    if (typeof s.portion === 'string') set.portion = s.portion.trim();
    if (typeof s.snack === 'boolean') set.snack = s.snack;
    if (e.remove !== true && Object.keys(set).length === 0) return [];
    return [{ section: e.section, index: e.index as number, ...(e.remove === true ? { remove: true } : {}), set }];
  });
  if (edits.length) out.edits = edits;
  const allergy = strs(o.allergy);
  if (allergy.length) out.allergy = allergy;
  // a replaced part with nothing in it means "delete this part"
  const replace = only(o.replace, SECTIONS);
  const isEmpty = (x: unknown) => !x || (Array.isArray(x) ? x.length === 0 : Object.keys(x).length === 0);
  // every section replaced by nothing = the whole day goes
  if (o.deleteDay === true || (SECTIONS.every(k => replace.includes(k)) && SECTIONS.every(k => isEmpty(out[k])))) out.deleteDay = true;
  const empty = { dayMilks: [], night: {}, solids: [], poop: {}, allergy: [] };
  for (const k of replace) (out as Record<string, unknown>)[k] ??= empty[k];
  if (replace.length) out.replace = replace;
  return SECTIONS.some(k => out[k] !== undefined) || out.edits || out.deleteDay ? out : null;
}

const uniq = <T,>(a: T[]) => [...new Set(a)];
const sumKey = (a: number | undefined, b: number | undefined) => (a === undefined && b === undefined ? undefined : (a ?? 0) + (b ?? 0));

// Gemini sometimes sends the saved records back with the new one at the end. If the saved ones come first, unchanged, cut them off.
const stable = (x: unknown) => JSON.stringify(x, (_, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v));
const withoutCopy = <R,>(saved: R[], added: R[]): R[] =>
  saved.length > 0 && added.length > saved.length && saved.every((r, i) => stable(r) === stable(added[i])) ? added.slice(saved.length) : added;

const pickMilkSet = (s: NonNullable<VoiceEdit['set']>): MilkFields => ({
  ...(s.momMl ? { momMl: s.momMl } : {}), ...(s.formulaMl ? { formulaMl: s.formulaMl } : {}), ...(s.momWays ? { momWays: s.momWays } : {}),
});
function applySolid(m: SolidMeal, s: NonNullable<VoiceEdit['set']>): SolidMeal {
  const { portion, snack, ...rest } = { ...m, ...(s.foods ? { foods: s.foods } : {}), ...(s.portion !== undefined ? { portion: s.portion } : {}), ...(s.snack !== undefined ? { snack: s.snack } : {}) };
  return { ...rest, ...(portion ? { portion } : {}), ...(snack ? { snack: true } : {}) }; // "" and false clear the field
}

// A note ADDS to the day by default, it never wipes it. Sections in v.replace are overwritten instead.
// When adding:
// - milk feeds and solid meals are added as new records (a new feed was said)
// - night milk, poop times and ml are added up; colors, textures, reactions are joined
// The whole entry is rebuilt like the form does, so older shapes (foods, momTimes) are carried over.
export function mergeVoiceFood(old: FoodEntry | undefined, v: VoiceFood, date: string): FoodEntry {
  const keep = (k: VoiceSection) => !v.replace?.includes(k);
  // edits hit the saved records by position (the same list Gemini was shown); a position that does not exist is ignored
  const fix = <R,>(list: R[], section: VoiceEdit['section'], apply: (r: R, set: NonNullable<VoiceEdit['set']>) => R) =>
    list.flatMap((r, i): R[] => {
      const e = v.edits?.find(x => x.section === section && x.index === i);
      return !e ? [r] : e.remove ? [] : [apply(r, e.set ?? {})];
    });
  const oldDays = old && keep('dayMilks') ? dayMilksOf(old) : [];
  const oldSolids = old && keep('solids') ? solidsOf(old) : [];
  const days = [...fix(oldDays, 'dayMilks', (m, set) => ({ ...m, ...pickMilkSet(set) })), ...withoutCopy(oldDays, v.dayMilks ?? [])];
  const solids = [...fix(oldSolids, 'solids', applySolid), ...withoutCopy(oldSolids, v.solids ?? [])];
  let night = keep('night') ? old?.night : undefined;
  if (v.night) {
    const momMl = sumKey(night?.momMl, v.night.momMl);
    const formulaMl = sumKey(night?.formulaMl, v.night.formulaMl);
    const momWays = uniq([...(night?.momWays ?? []), ...(v.night.momWays ?? [])]);
    night = { ...night, ...(momMl !== undefined ? { momMl } : {}), ...(formulaMl !== undefined ? { formulaMl } : {}), ...(momWays.length ? { momWays } : {}) };
  }
  let poop = keep('poop') ? old?.poop : undefined;
  if (v.poop) {
    const times = sumKey(poop?.times, v.poop.times);
    const colors = uniq([...(poop?.colors ?? []), ...(v.poop.colors ?? [])]);
    const textures = uniq([...(poop?.textures ?? []), ...(v.poop.textures ?? [])]);
    const note = [poop?.note, v.poop.note].filter(Boolean).join(', ');
    poop = { ...(times !== undefined ? { times } : {}), ...(colors.length ? { colors } : {}), ...(textures.length ? { textures } : {}), ...(note ? { note } : {}) };
  }
  const allergy = uniq([...(keep('allergy') ? old?.allergy ?? [] : []), ...(v.allergy ?? [])]);
  return {
    id: date,
    date,
    ...splitDayMilks(days),
    ...(night && Object.keys(night).length ? { night } : {}),
    ...(poop && Object.keys(poop).length ? { poop } : {}),
    ...(allergy.length ? { allergy } : {}),
    ...(solids.length ? { solids } : {}),
  };
}
