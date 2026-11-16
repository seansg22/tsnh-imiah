import { describe, expect, it } from 'vitest';
import { foodVoicePrompt, mergeVoiceFood, parseVoiceFood } from './voiceFood';
import type { FoodEntry } from '../types';

describe('parseVoiceFood', () => {
  it('reads a full answer, even inside a code fence', () => {
    const text = '```json\n' + JSON.stringify({
      dayMilks: [{ momMl: 120, momWays: ['bottle'] }, { formulaMl: 90 }],
      night: { momMl: 60 },
      solids: [{ foods: ['porridge', 'cháo bí đỏ'], portion: '2 muỗng', snack: false }, { foods: ['banana'], snack: true }],
      poop: { times: 2, colors: ['yellow'], textures: ['soft'] },
      allergy: ['rash'],
    }) + '\n```';
    expect(parseVoiceFood(text)).toEqual({
      dayMilks: [{ momMl: 120, momWays: ['bottle'] }, { formulaMl: 90 }],
      night: { momMl: 60 },
      solids: [{ foods: ['porridge', 'cháo bí đỏ'], portion: '2 muỗng' }, { foods: ['banana'], snack: true }],
      poop: { times: 2, colors: ['yellow'], textures: ['soft'] },
      allergy: ['rash'],
    });
  });

  it('drops bad values instead of filling the form with them', () => {
    const text = JSON.stringify({
      dayMilks: [{ momMl: -5 }, { momMl: 'lots' }],
      solids: [{ foods: [] }],
      poop: { colors: ['purple'], textures: ['slimy'] },
    });
    expect(parseVoiceFood(text)).toBeNull();
  });

  it('returns null for text that is not JSON', () => {
    expect(parseVoiceFood('Sorry, I did not understand')).toBeNull();
    expect(parseVoiceFood('{broken')).toBeNull();
  });

  it('only keeps ways when there is mom milk', () => {
    expect(parseVoiceFood('{"dayMilks":[{"formulaMl":80,"momWays":["breast"]}]}')).toEqual({ dayMilks: [{ formulaMl: 80 }] });
  });
});

describe('parseVoiceFood date', () => {
  it('keeps a said date, ignores a bad one', () => {
    expect(parseVoiceFood('{"date":"2026-11-15","poop":{"times":1}}')?.date).toBe('2026-11-15');
    expect(parseVoiceFood('{"date":"yesterday","poop":{"times":1}}')?.date).toBeUndefined();
  });
  it('a date alone is not a note', () => {
    expect(parseVoiceFood('{"date":"2026-11-15"}')).toBeNull();
  });
});

describe('mergeVoiceFood', () => {
  const d = '2026-11-16';
  it('creates a new day from a tiny note', () => {
    expect(mergeVoiceFood(undefined, { poop: { times: 1, colors: ['yellow'] } }, d)).toEqual({ id: d, date: d, poop: { times: 1, colors: ['yellow'] } });
  });

  it('adds a milk feed without touching the rest of the day', () => {
    const old: FoodEntry = { id: d, date: d, momMl: 100, poop: { times: 1 }, solids: [{ foods: ['banana'] }], allergy: ['rash'] };
    const out = mergeVoiceFood(old, { dayMilks: [{ formulaMl: 90 }] }, d);
    expect(out).toEqual({ id: d, date: d, momMl: 100, moreMilks: [{ formulaMl: 90 }], poop: { times: 1 }, solids: [{ foods: ['banana'] }], allergy: ['rash'] });
  });

  it('adds up poop and night milk, joins the lists', () => {
    const old: FoodEntry = { id: d, date: d, night: { momMl: 60, momWays: ['breast'] }, poop: { times: 1, colors: ['yellow'], note: 'a' } };
    const out = mergeVoiceFood(old, { night: { momMl: 40, momWays: ['bottle'] }, poop: { times: 1, colors: ['yellow', 'green'], note: 'b' }, allergy: ['rash'] }, d);
    expect(out.night).toEqual({ momMl: 100, momWays: ['breast', 'bottle'] });
    expect(out.poop).toEqual({ times: 2, colors: ['yellow', 'green'], note: 'a, b' });
    expect(out.allergy).toEqual(['rash']);
  });

  it('carries an older entry (foods, momTimes) over without losing it', () => {
    const old = { id: d, date: d, momTimes: 3, foods: ['pumpkin'], portion: '50 g' } as FoodEntry;
    const out = mergeVoiceFood(old, { solids: [{ foods: ['banana'], snack: true }] }, d);
    expect(out.momTimes).toBe(3);
    expect(out.solids).toEqual([{ foods: ['pumpkin'], portion: '50 g' }, { foods: ['banana'], snack: true }]);
    expect(out.foods).toBeUndefined();
  });

  it('replace overwrites only the named section', () => {
    const old: FoodEntry = { id: d, date: d, momMl: 100, poop: { times: 3, colors: ['green'] }, allergy: ['rash'] };
    const out = mergeVoiceFood(old, { poop: { times: 1 }, replace: ['poop'] }, d);
    expect(out.poop).toEqual({ times: 1 });
    expect(out.momMl).toBe(100);
    expect(out.allergy).toEqual(['rash']);
  });

  it('replace on milk drops the old day milks', () => {
    const old: FoodEntry = { id: d, date: d, momMl: 100, moreMilks: [{ formulaMl: 90 }] };
    expect(mergeVoiceFood(old, { dayMilks: [{ momMl: 120 }], replace: ['dayMilks'] }, d)).toEqual({ id: d, date: d, momMl: 120 });
  });
});

describe('parseVoiceFood replace', () => {
  const d = '2026-11-16';
  it('keeps only sections that are really in the note', () => {
    expect(parseVoiceFood('{"poop":{"times":1},"replace":["poop","nonsense"]}')?.replace).toEqual(['poop']);
  });

  it('a replaced part with nothing in it means delete', () => {
    const v = parseVoiceFood('{"date":"2026-11-02","allergy":[],"replace":["allergy"]}');
    expect(v).toEqual({ date: '2026-11-02', allergy: [], replace: ['allergy'] });
    const old: FoodEntry = { id: '2026-11-02', date: '2026-11-02', momMl: 100, poop: { times: 2 }, allergy: ['rash'] };
    expect(mergeVoiceFood(old, v!, '2026-11-02')).toEqual({ id: '2026-11-02', date: '2026-11-02', momMl: 100, poop: { times: 2 } });
  });

  it('deleting poop leaves no empty poop object', () => {
    const old: FoodEntry = { id: d, date: d, momMl: 100, poop: { times: 2 } };
    expect(mergeVoiceFood(old, { poop: {}, replace: ['poop'] }, d).poop).toBeUndefined();
  });
});

describe('foodVoicePrompt', () => {
  const day = (date: string): FoodEntry => ({ id: date, date, momMl: 100, solids: [{ foods: ['thịt kho'] }] });
  it('holds the saved days of the last 14 days only', () => {
    const p = foodVoicePrompt('2026-11-16', [day('2026-11-02'), day('2026-10-01')]);
    expect(p).toContain('"date":"2026-11-02"');
    expect(p).toContain('thịt kho');
    expect(p).not.toContain('2026-10-01');
  });
  it('shows an older entry in the new shape', () => {
    const old = { id: 'x', date: '2026-11-10', momTimes: 3, momMl: 60, foods: ['pumpkin'] } as FoodEntry;
    const p = foodVoicePrompt('2026-11-16', [old]);
    expect(p).toContain('"momMl":180');
    expect(p).toContain('"solids":[{"foods":["pumpkin"]}]');
  });
});

describe('per-record edits', () => {
  const d = '2026-11-02';
  const old: FoodEntry = {
    id: d, date: d, momMl: 100, moreMilks: [{ formulaMl: 90 }],
    solids: [{ foods: ['porridge'], portion: '120 ml' }, { foods: ['thịt kho'] }],
  };
  const parse = (edits: unknown) => parseVoiceFood(JSON.stringify({ date: d, edits }))!;

  it('makes one meal a snack and keeps the other meals', () => {
    const v = parse([{ section: 'solids', index: 1, set: { snack: true } }]);
    expect(mergeVoiceFood(old, v, d).solids).toEqual([{ foods: ['porridge'], portion: '120 ml' }, { foods: ['thịt kho'], snack: true }]);
  });

  it('changes the amount of the second milk only', () => {
    const v = parse([{ section: 'dayMilks', index: 1, set: { formulaMl: 80 } }]);
    const out = mergeVoiceFood(old, v, d);
    expect(out.momMl).toBe(100);
    expect(out.moreMilks).toEqual([{ formulaMl: 80 }]);
  });

  it('removes one record, and snack false / empty portion clear the field', () => {
    expect(mergeVoiceFood(old, parse([{ section: 'solids', index: 0, remove: true }]), d).solids).toEqual([{ foods: ['thịt kho'] }]);
    const snacky: FoodEntry = { ...old, solids: [{ foods: ['banana'], snack: true, portion: '2 muỗng' }] };
    expect(mergeVoiceFood(snacky, parse([{ section: 'solids', index: 0, set: { snack: false, portion: '' } }]), d).solids).toEqual([{ foods: ['banana'] }]);
  });

  it('ignores a record that does not exist and a bad edit', () => {
    expect(mergeVoiceFood(old, parse([{ section: 'solids', index: 9, set: { snack: true } }]), d).solids).toEqual(old.solids);
    expect(parseVoiceFood(JSON.stringify({ edits: [{ section: 'poop', index: 0, set: { momMl: 5 } }, { section: 'solids', index: -1, remove: true }] }))).toBeNull();
  });
});

describe('Gemini copies the saved records back', () => {
  const d = '2026-11-02';
  const old: FoodEntry = { id: d, date: d, momWays: ['breast'], momMl: 300, formulaMl: 80, moreMilks: [{ momMl: 23 }], solids: [{ foods: ['banana'] }] };
  it('adds only the new milk', () => {
    const v = parseVoiceFood(JSON.stringify({ date: d, dayMilks: [{ momWays: ['breast'], momMl: 300, formulaMl: 80 }, { momMl: 23 }, { formulaMl: 500 }] }))!;
    expect(mergeVoiceFood(old, v, d).moreMilks).toEqual([{ momMl: 23 }, { formulaMl: 500 }]);
  });
  it('still adds a feed that looks like a saved one', () => {
    const one: FoodEntry = { id: d, date: d, momMl: 100 };
    expect(mergeVoiceFood(one, { dayMilks: [{ momMl: 100 }] }, d).moreMilks).toEqual([{ momMl: 100 }]);
  });
  it('same for meals', () => {
    const v = parseVoiceFood(JSON.stringify({ solids: [{ foods: ['banana'] }, { foods: ['pumpkin'] }] }))!;
    expect(mergeVoiceFood(old, v, d).solids).toEqual([{ foods: ['banana'] }, { foods: ['pumpkin'] }]);
  });
});

describe('delete a whole day', () => {
  it('reads deleteDay', () => {
    expect(parseVoiceFood('{"date":"2026-11-02","deleteDay":true}')).toMatchObject({ date: '2026-11-02', deleteDay: true });
  });
  it('reads "every section replaced by nothing" as delete the day', () => {
    const text = '{"date":"2026-11-02","dayMilks":[],"night":{},"solids":[],"poop":{},"replace":["dayMilks","night","solids","poop","allergy"]}';
    expect(parseVoiceFood(text)?.deleteDay).toBe(true);
  });
  it('clearing only some sections is not a day delete', () => {
    expect(parseVoiceFood('{"allergy":[],"replace":["allergy"]}')?.deleteDay).toBeUndefined();
  });
});
