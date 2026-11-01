import { describe, expect, it } from 'vitest';
import { ALLERGIES, FOODS, MAIN_FOODS, PORTIONS, SNACK_FOODS, TOP_FOODS, POOP_COLORS, POOP_TEXTURES } from './foodOptions';
import { fd } from '../../i18n/strings/fd';

// older entries store these keys, so every one must keep a label (en and vi share keys, tsc checks that)
const labels = fd.en as Record<string, string>;
const has = (key: string) => typeof labels[key] === 'string' && labels[key] !== '';

describe('food options', () => {
  it('quick picks are all known foods', () => {
    for (const f of [...TOP_FOODS, ...MAIN_FOODS, ...SNACK_FOODS]) expect(FOODS).toContain(f);
  });

  it('every food, portion, allergy, poop color and texture has a label', () => {
    for (const f of FOODS) expect(has(`fd.food.${f}`), `food ${f}`).toBe(true);
    for (const p of PORTIONS) expect(has(`fd.portion.${p}`), `portion ${p}`).toBe(true);
    for (const a of ALLERGIES) expect(has(`fd.allergy.${a}`), `allergy ${a}`).toBe(true);
    for (const c of Object.keys(POOP_COLORS)) expect(has(`fd.poopColor.${c}`), `color ${c}`).toBe(true);
    for (const x of POOP_TEXTURES) expect(has(`fd.poopTexture.${x}`), `texture ${x}`).toBe(true);
  });
});
