export const FOODS = ['porridge', 'pumpkin', 'carrot', 'sweetPotato', 'banana', 'avocado', 'apple', 'eggYolk', 'fish', 'chicken', 'tofu', 'oliveOil', 'rice', 'oats', 'potato', 'broccoli', 'spinach', 'pea', 'tomato', 'pear', 'mango', 'beef', 'pork', 'shrimp', 'yogurt', 'cheese', 'cereal', 'steamedPear', 'steamedApple', 'salmonOil', 'fat', 'softRice'] as const;
// chips shown in the form; FOODS stays the full list so older notes still get translated labels
export const TOP_FOODS: (typeof FOODS)[number][] = ['porridge', 'banana', 'avocado', 'eggYolk', 'chicken', 'oliveOil', 'salmonOil', 'fat', 'softRice'];
// extra quick picks on top of TOP_FOODS, depending on main meal or snack
export const MAIN_FOODS: (typeof FOODS)[number][] = ['cereal', 'porridge', 'pork', 'chicken', 'beef', 'eggYolk'];
export const SNACK_FOODS: (typeof FOODS)[number][] = ['banana', 'avocado', 'steamedPear', 'steamedApple'];
export const PORTIONS = ['spoons', 'quarter', 'half', 'threeQuarter', 'whole', 'more'] as const;
export const ALLERGIES = ['rash', 'vomit', 'diarrhea', 'swelling', 'fussy', 'cough'] as const;
export const POOP_COLORS = { yellow: '#E8C547', green: '#6B9E4A', brown: '#8B5A2B', black: '#2B2B2B', red: '#D64545', pale: '#E3DDD0' } as const;
export type PoopColor = keyof typeof POOP_COLORS;
export const POOP_TEXTURES = ['watery', 'soft', 'normal', 'hard'] as const;
