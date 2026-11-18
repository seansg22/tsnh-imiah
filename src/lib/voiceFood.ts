import type { FoodEntry, MilkFields, PoopLog, SolidMeal } from '../types';
import { solidsOf } from './solids';
import { dayMilksOf, splitDayMilks } from './dayMilks';
import { foldTimes } from './foodForm';
import { ALLERGIES, FOODS, POOP_COLORS, POOP_TEXTURES } from '../components/food/foodOptions';

// Gemini gets the saved days and the note, and answers with the WHOLE new day. No edit rules on our side.
export type VoiceDay = Omit<FoodEntry, 'id' | 'date'>;
export interface VoiceFood {
  date?: string; // "YYYY-MM-DD", the day the note is about; today when not said
  day: VoiceDay | null; // the day after the note; null = delete the day
}

// a saved day in the same shape Gemini must answer with
const dayJson = (e: FoodEntry) => ({
  dayMilks: dayMilksOf(e).map(foldTimes),
  ...(e.night ? { night: foldTimes(e.night) } : {}),
  solids: solidsOf(e),
  ...(e.poop ? { poop: e.poop } : {}),
  ...(e.allergy?.length ? { allergy: e.allergy } : {}),
});

export const foodVoicePrompt = (date: string, today: string, entries: FoodEntry[] = []) => {
  const saved = entries.find(e => e.date === date);
  return `You update a baby's food diary from a short spoken note (Vietnamese or English, may have speech-to-text mistakes). The note can be tiny, like only one milk or only poop.
Today is ${today}. The note is about ${date}.
Saved day ${date}: ${saved ? JSON.stringify(dayJson(saved)) : 'none'}
Reply with ONE JSON object only, no markdown:
{"date": "${date}", "day": the COMPLETE day after the note, or null to delete the whole day}
"day" has this shape, leave out what is empty:
{
 "dayMilks": [{"momMl": number, "momWays": ["breast"|"bottle"], "formulaMl": number}],
 "night": {same as one dayMilks item},
 "solids": [{"foods": string[], "portion": string, "snack": boolean}],
 "poop": {"times": number, "colors": string[], "textures": string[], "note": string},
 "allergy": string[]
}
Rules:
- Start from the saved day above (none = an empty day). Copy EVERYTHING the note does not talk about, unchanged and in the same order.
- Adding ("thêm một cữ 500ml") = append a new item to dayMilks or solids. Fixing ("sửa lại", "nhầm", "đổi thành", "bữa thịt kho là bữa phụ") = change only that item. Deleting ("xóa", "bỏ", "remove") = leave that item out.
- night and poop are ONE record per day. If the speaker adds to them, add up the numbers and join the lists. If they correct them, replace the value.
- "xóa cả ngày" = "day": null.
- One dayMilks item per separate daytime milk feed. Night milk goes in "night". Amounts are in ml.
- momMl = mom's milk, formulaMl = formula milk. momWays: breast (direct) and/or bottle.
- solids: one item per meal. snack = true for a snack (bữa phụ). portion is free text like "50 ml" or "2 muỗng".
- foods: use these keys when the food matches: ${FOODS.join(', ')}. Otherwise write the food in the user's language.
- poop colors only: ${Object.keys(POOP_COLORS).join(', ')}. textures only: ${POOP_TEXTURES.join(', ')}.
- allergy: use these keys when they match: ${ALLERGIES.join(', ')}. Otherwise free text.
- Ignore clock times, the diary has no time field.`;
};

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim()) : []);
const only = <T extends string>(v: unknown, allowed: readonly T[]) => strs(v).filter((x): x is T => (allowed as readonly string[]).includes(x));

function milk(v: unknown): MilkFields {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const momMl = num(o.momMl), formulaMl = num(o.formulaMl);
  const momTimes = num(o.momTimes), formulaTimes = num(o.formulaTimes); // older entries with times and no ml: keep them
  const momWays = only(o.momWays, ['breast', 'bottle'] as const);
  return {
    ...(momTimes ? { momTimes } : {}), ...(momMl ? { momMl } : {}), ...((momMl || momTimes) && momWays.length ? { momWays } : {}),
    ...(formulaTimes ? { formulaTimes } : {}), ...(formulaMl ? { formulaMl } : {}),
  };
}

function parseDay(d: Record<string, unknown>): VoiceDay {
  const dayMilks = (Array.isArray(d.dayMilks) ? d.dayMilks : []).map(milk).filter(m => Object.keys(m).length);
  const night = milk(d.night);
  const solids = (Array.isArray(d.solids) ? d.solids : []).flatMap((s): SolidMeal[] => {
    const r = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    const foods = strs(r.foods);
    const portion = typeof r.portion === 'string' ? r.portion.trim() : '';
    return foods.length ? [{ foods, ...(portion ? { portion } : {}), ...(r.snack === true ? { snack: true } : {}) }] : [];
  });
  const p = (d.poop && typeof d.poop === 'object' ? d.poop : {}) as Record<string, unknown>;
  const times = num(p.times);
  const colors = only(p.colors, Object.keys(POOP_COLORS) as (keyof typeof POOP_COLORS)[]);
  const textures = only(p.textures, POOP_TEXTURES);
  const note = typeof p.note === 'string' ? p.note.trim() : '';
  const poop: PoopLog = { ...(times ? { times } : {}), ...(colors.length ? { colors } : {}), ...(textures.length ? { textures } : {}), ...(note ? { note } : {}) };
  const allergy = [...new Set(strs(d.allergy))];
  return {
    ...splitDayMilks(dayMilks),
    ...(Object.keys(night).length ? { night } : {}),
    ...(solids.length ? { solids } : {}),
    ...(Object.keys(poop).length ? { poop } : {}),
    ...(allergy.length ? { allergy } : {}),
  };
}

// Gemini text -> a safe day. null if it is not usable JSON.
// "day" must be there: an object (may be empty) or null. A missing "day" is a bad answer, not a delete.
export function parseVoiceFood(text: string): VoiceFood | null {
  let o: Record<string, unknown>;
  try {
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1); // drops ``` fences and chatter
    o = JSON.parse(json);
  } catch {
    return null;
  }
  const { day, date } = o;
  if (day !== null && (typeof day !== 'object' || Array.isArray(day))) return null;
  return {
    ...(typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
    day: day === null ? null : parseDay(day as Record<string, unknown>),
  };
}
