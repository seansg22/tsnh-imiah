import { describe, expect, it } from 'vitest';
import { foodVoiceHint, foodVoicePrompt, parseVoiceFood } from './voiceFood';
import { dayMilksOf } from './dayMilks';
import { solidsOf } from './solids';
import type { FoodEntry } from '../types';

const ans = (day: unknown, extra = {}) => JSON.stringify({ date: '2026-11-16', day, ...extra });

describe('parseVoiceFood', () => {
  it('reads a whole day, even inside a code fence', () => {
    const text = '```json\n' + ans({
      dayMilks: [{ momMl: 120, momWays: ['bottle'] }, { formulaMl: 90 }],
      night: { momMl: 60 },
      solids: [{ foods: ['porridge', 'cháo bí đỏ'], portion: '2 muỗng', snack: false }, { foods: ['banana'], snack: true }],
      poop: { times: 2, colors: ['yellow'], textures: ['soft'] },
      allergy: ['rash', 'rash'],
    }) + '\n```';
    expect(parseVoiceFood(text)).toEqual({
      date: '2026-11-16',
      day: {
        momMl: 120, momWays: ['bottle'], moreMilks: [{ formulaMl: 90 }],
        night: { momMl: 60 },
        solids: [{ foods: ['porridge', 'Cháo Bí Đỏ'], portion: '2 muỗng' }, { foods: ['banana'], snack: true }],
        poop: { times: 2, colors: ['yellow'], textures: ['soft'] },
        allergy: ['rash'],
      },
    });
  });

  it('drops bad values instead of saving them', () => {
    const text = ans({ dayMilks: [{ momMl: -5 }, { momMl: 'lots' }], solids: [{ foods: [] }], poop: { colors: ['purple'], textures: ['slimy'] } });
    expect(parseVoiceFood(text)).toEqual({ date: '2026-11-16', day: {} });
  });

  it('null day = delete the day, empty day is not null', () => {
    expect(parseVoiceFood(ans(null))?.day).toBeNull();
    expect(parseVoiceFood(ans({}))?.day).toEqual({});
  });

  it('a missing or wrong day is a bad answer, never a delete', () => {
    expect(parseVoiceFood('{"date":"2026-11-16"}')).toBeNull();
    expect(parseVoiceFood('{"day":[]}')).toBeNull();
    expect(parseVoiceFood('{"day":"x"}')).toBeNull();
  });

  it('returns null for text that is not JSON', () => {
    expect(parseVoiceFood('Sorry, I did not understand')).toBeNull();
    expect(parseVoiceFood('{broken')).toBeNull();
  });

  it('only keeps ways when there is mom milk', () => {
    expect(parseVoiceFood(ans({ dayMilks: [{ formulaMl: 80, momWays: ['breast'] }] }))?.day).toEqual({ formulaMl: 80 });
  });

  it('keeps a said date, ignores a bad one', () => {
    expect(parseVoiceFood('{"date":"2026-11-15","day":{}}')?.date).toBe('2026-11-15');
    expect(parseVoiceFood('{"date":"yesterday","day":{}}')?.date).toBeUndefined();
  });
});

describe('older saved entries survive the round trip', () => {
  // old shape in -> what Gemini is shown -> Gemini copies it back -> parse -> same data
  const roundTrip = (e: FoodEntry) => {
    const prompt = foodVoicePrompt(e.date, '2026-11-16', [e]);
    const day = JSON.parse(prompt.match(/^Saved day .*?: (\{.*\})$/m)![1]); // what Gemini is shown
    return { out: parseVoiceFood(JSON.stringify({ date: e.date, day }))!.day! };
  };

  it('foods + momTimes with ml (old shape)', () => {
    const old = { id: 'x', date: '2026-11-10', momTimes: 3, momMl: 60, foods: ['pumpkin'], portion: 'half' } as FoodEntry;
    const { out } = roundTrip(old);
    expect(out.momMl).toBe(180);
    expect(solidsOf({ id: 'x', date: 'x', ...out })).toEqual([{ foods: ['pumpkin'], portion: 'half' }]);
  });

  it('times with no ml are kept', () => {
    const old = { id: 'x', date: '2026-11-10', momTimes: 4, momWays: ['breast'], formulaTimes: 2 } as FoodEntry;
    const { out } = roundTrip(old);
    expect(out).toEqual({ momTimes: 4, momWays: ['breast'], formulaTimes: 2 });
  });

  it('an entry with old and new fields keeps every record', () => {
    const old: FoodEntry = {
      id: 'x', date: '2026-11-10', momMl: 100, moreMilks: [{ formulaMl: 90 }], night: { momMl: 50 },
      foods: ['pumpkin'], solids: [{ foods: ['thịt kho'], snack: true }], poop: { times: 1, note: 'ok' }, allergy: ['rash'],
    };
    const { out } = roundTrip(old);
    expect(dayMilksOf({ id: 'x', date: 'x', ...out })).toEqual([{ momMl: 100 }, { formulaMl: 90 }]);
    expect(out.night).toEqual({ momMl: 50 });
    expect(out.poop).toEqual({ times: 1, note: 'ok' });
    expect(out.allergy).toEqual(['rash']);
    expect(out.solids).toEqual([{ foods: ['Thịt Kho'], snack: true }]); // same food, only the case of a free-text name changes
  });

  it('foods already saved keep their spelling, new free-text foods get Title Case', () => {
    const e: FoodEntry = { id: 'x', date: '2026-11-23', solids: [{ foods: ['cá hồi', 'Súp lơ', 'softRice'] }] };
    const text = JSON.stringify({ date: e.date, day: { solids: [{ foods: ['Cá hồi', 'súp lơ', 'com nat', 'giò heo'] }] } });
    expect(parseVoiceFood(text, [e])!.day!.solids![0].foods).toEqual(['cá hồi', 'Súp lơ', 'softRice', 'Giò Heo']);
  });

  it('an empty entry stays empty', () => {
    expect(roundTrip({ id: 'x', date: '2026-11-10' }).out).toEqual({});
  });
});

describe('foodVoicePrompt', () => {
  const day = (date: string): FoodEntry => ({ id: date, date, momMl: 100, solids: [{ foods: ['thịt kho'] }] });
  it('holds only the saved day of the note', () => {
    const p = foodVoicePrompt('2026-11-03', '2026-11-18', [day('2026-11-03'), { ...day('2026-10-01'), momMl: 777 }]);
    expect(p).toContain('thịt kho');
    expect(p).not.toContain('777');
  });
  it('says none for a day with no note', () => {
    expect(foodVoicePrompt('2026-11-03', '2026-11-18', [])).toContain('Saved day 2026-11-03: none');
  });

  it('lists every food and allergy key with its Vietnamese and English name', () => {
    const p = foodVoicePrompt('2026-11-04', '2026-11-23', []);
    expect(p).toContain('apple = Táo / Apple');
    expect(p).toContain('rash = Nổi mẩn / Rash');
  });

  it('a display name from Gemini becomes the key, so the chip shows', () => {
    const day = (foods: string[], allergy: string[] = []) => parseVoiceFood(JSON.stringify({ date: '2026-11-04', day: { solids: [{ foods }], allergy } }))!.day!;
    expect(day(['cơm nát', 'Cơm Nát', 'Táo', 'banana', 'com nat']).solids![0].foods).toEqual(['softRice', 'apple', 'banana']);
    expect(day(['cá hồi', 'giò heo', 'GIÒ HEO']).solids![0].foods).toEqual(['Cá Hồi', 'Giò Heo']); // no chip: free text, in Title Case
    expect(day(['rice'], ['nổi mẩn', 'Ho', 'đau bụng']).allergy).toEqual(['rash', 'cough', 'đau bụng']);
  });

  it('tells Gemini the speaker language', () => {
    expect(foodVoicePrompt('2026-11-04', '2026-11-23', [], 'vi')).toContain("The speaker's language is Vietnamese.");
    expect(foodVoicePrompt('2026-11-04', '2026-11-23', [], 'en')).toContain("The speaker's language is English.");
  });
});

describe('foodVoiceHint', () => {
  it('has the app food names in the speaker language, then foods the family typed, and stays short', () => {
    const e = { id: 'x', date: '2026-11-01', solids: [{ foods: ['cá hồi', 'apple'] }] } as FoodEntry;
    const vi = foodVoiceHint('vi', [e]);
    expect(vi).toContain('Cơm nát');
    expect(vi.endsWith('cá hồi')).toBe(true); // last = what Whisper keeps for sure
    expect(vi).not.toContain('apple'); // a key is already in the list as "Táo"
    expect(foodVoiceHint('en')).toContain('Soft rice');
    expect(foodVoiceHint('vi', Array.from({ length: 60 }, (_, i) => ({ id: `${i}`, date: `2026-01-${i}`, solids: [{ foods: [`món số ${i}`] }] }) as FoodEntry)).length).toBeLessThanOrEqual(500);
  });

  it('warns Gemini that the note is speech-to-text', () => {
    expect(foodVoicePrompt('2026-11-04', '2026-11-23', [])).toContain('words can be misheard');
  });
});
