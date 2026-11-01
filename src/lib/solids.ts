import type { FoodEntry, SolidMeal } from '../types';

// older entries kept one solid meal in foods/portion
export const solidsOf = (e: FoodEntry): SolidMeal[] =>
  e.solids ?? (e.foods?.length ? [{ foods: e.foods, ...(e.portion ? { portion: e.portion } : {}) }] : []);
