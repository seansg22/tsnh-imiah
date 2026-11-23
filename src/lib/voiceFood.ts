import type { FoodEntry, MilkFields, PoopLog, SolidMeal } from '../types';
import { solidsOf } from './solids';
import { dayMilksOf, splitDayMilks } from './dayMilks';
import { foldTimes } from './foodForm';
import { translate, type UiKey } from '../i18n/ui';
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

// "apple = Táo / Apple": the key Gemini must answer with, then the names a speaker may use
const options = (group: 'food' | 'allergy', keys: readonly string[]) =>
  keys.map(k => `${k} = ${translate('vi', `fd.${group}.${k}` as UiKey)} / ${translate('en', `fd.${group}.${k}` as UiKey)}`).join('\n  ');

// Spelling hint for Whisper (Groq "prompt" field): the words a food note is likely to hold.
// Whisper only keeps the last ~224 tokens, so the most useful words go last: the app's foods, then foods this family already typed.
const HINT_WORDS = {
  vi: ['bữa phụ', 'ăn dặm', 'sữa mẹ', 'sữa công thức', 'bú bình', 'cữ sữa', 'đi ị', 'muỗng', 'ml'],
  en: ['snack', 'breast milk', 'formula', 'bottle', 'poop', 'spoons', 'ml'],
};
export const foodVoiceHint = (lang: 'vi' | 'en', entries: FoodEntry[] = []) => {
  const known = FOODS.map(k => translate(lang, `fd.food.${k}` as UiKey));
  const mine = [...new Set(entries.flatMap(e => solidsOf(e).flatMap(m => m.foods)).filter(f => !(FOODS as readonly string[]).includes(f)))];
  const words = [...HINT_WORDS[lang], ...known, ...mine.slice(-15)];
  let text = words.join(', ');
  while (text.length > 500 && words.length) text = words.splice(0, 1) && words.join(', '); // too long: drop from the front
  return text;
};

export const foodVoicePrompt = (date: string, today: string, entries: FoodEntry[] = [], lang: 'vi' | 'en' = 'vi') => {
  const saved = entries.find(e => e.date === date);
  return `You update a baby's food diary from a short spoken note (Vietnamese or English, may have speech-to-text mistakes). The note can be tiny, like only one milk or only poop.
The speaker's language is ${lang === 'vi' ? 'Vietnamese' : 'English'}.
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
- The note is speech-to-text, so words can be misheard (wrong accents, a similar-sounding word, numbers split or merged). If a word is close in sound to an option below or to a food already saved, use that option. Never invent a food, milk amount or meal the note does not hint at. If unsure, keep the speaker's words as they are.
- Start from the saved day above (none = an empty day). Copy EVERYTHING the note does not talk about, unchanged and in the same order.
- Adding ("thêm một cữ 500ml") = append a new item to dayMilks or solids. Fixing ("sửa lại", "nhầm", "đổi thành", "bữa thịt kho là bữa phụ") = change only that item. Deleting ("xóa", "bỏ", "remove") = leave that item out.
- night and poop are ONE record per day. If the speaker adds to them, add up the numbers and join the lists. If they correct them, replace the value.
- "xóa cả ngày" = "day": null.
- One dayMilks item per separate daytime milk feed. Night milk goes in "night". Amounts are in ml.
- momMl = mom's milk, formulaMl = formula milk. momWays: breast (direct) and/or bottle.
- solids: one item per meal. snack = true for a snack (bữa phụ). portion is free text like "50 ml" or "2 muỗng".
- foods: pick from the options below, answer with the key (left of "="). The speaker may say the Vietnamese or the English name. If NO option matches (e.g. salmon), customize: copy the speaker's own words, NEVER translate ("cá hồi" stays "cá hồi", never "salmon").
  ${options('food', FOODS)}
- Every free-text value (custom foods, portion, poop note, custom allergy) stays in the speaker's language (${lang === 'vi' ? 'Vietnamese' : 'English'}). Never translate.
- poop colors only: ${Object.keys(POOP_COLORS).join(', ')}. textures only: ${POOP_TEXTURES.join(', ')}.
- allergy: pick from the options below, answer with the key. If none matches, customize with the speaker's own words.
  ${options('allergy', ALLERGIES)}
- Ignore clock times, the diary has no time field.`;
};

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim()) : []);
// "Cơm nát", "com nat" and "softRice" are the same food: ignore case, accents and extra spaces
const plain = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
// a name Gemini wrote instead of the key (either language) goes back to the key, so the form shows the chip. Anything else stays free text.
const keyOf = (group: 'food' | 'allergy', keys: readonly string[]) => {
  const byName = new Map<string, string>();
  for (const k of keys) for (const n of [k, translate('vi', `fd.${group}.${k}` as UiKey), translate('en', `fd.${group}.${k}` as UiKey)]) byName.set(plain(n), k);
  return (x: string) => byName.get(plain(x)) ?? x;
};
// a custom food reads like a name: "giò heo" -> "Giò Heo"
const titleCase = (x: string) => x.toLocaleLowerCase('vi').replace(/(^|\s)\S/g, c => c.toLocaleUpperCase('vi'));
const toKey = keyOf('food', FOODS);
const foodKey = (x: string) => { const k = toKey(x); return (FOODS as readonly string[]).includes(k) ? k : titleCase(k); };
const allergyKey = keyOf('allergy', ALLERGIES);
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
    const foods = [...new Set(strs(r.foods).map(foodKey))];
    const portion = typeof r.portion === 'string' ? r.portion.trim() : '';
    return foods.length ? [{ foods, ...(portion ? { portion } : {}), ...(r.snack === true ? { snack: true } : {}) }] : [];
  });
  const p = (d.poop && typeof d.poop === 'object' ? d.poop : {}) as Record<string, unknown>;
  const times = num(p.times);
  const colors = only(p.colors, Object.keys(POOP_COLORS) as (keyof typeof POOP_COLORS)[]);
  const textures = only(p.textures, POOP_TEXTURES);
  const note = typeof p.note === 'string' ? p.note.trim() : '';
  const poop: PoopLog = { ...(times ? { times } : {}), ...(colors.length ? { colors } : {}), ...(textures.length ? { textures } : {}), ...(note ? { note } : {}) };
  const allergy = [...new Set(strs(d.allergy).map(allergyKey))];
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
