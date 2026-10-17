export const FOODS = ['porridge', 'pumpkin', 'carrot', 'sweetPotato', 'banana', 'avocado', 'apple', 'eggYolk', 'fish', 'chicken', 'tofu', 'oliveOil', 'rice', 'oats', 'potato', 'broccoli', 'spinach', 'pea', 'tomato', 'pear', 'mango', 'beef', 'pork', 'shrimp', 'yogurt', 'cheese'] as const;
// chips shown in the form; FOODS stays the full list so older notes still get translated labels
export const TOP_FOODS: (typeof FOODS)[number][] = ['porridge', 'pumpkin', 'carrot', 'sweetPotato', 'banana', 'avocado', 'eggYolk', 'fish', 'chicken', 'oliveOil'];
export const PORTIONS = ['spoons', 'quarter', 'half', 'threeQuarter', 'whole', 'more'] as const;
export const ALLERGIES = ['rash', 'vomit', 'diarrhea', 'swelling', 'fussy', 'cough'] as const;
