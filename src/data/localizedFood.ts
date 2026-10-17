import type { Lang } from '../i18n/langContext';
import * as en from './foodByMonth';
import * as vi from './vi/foodByMonth';

export function getFoodData(lang: Lang) {
  return lang === 'vi' ? vi : en;
}

export function getCategoryLabel(category: en.RecipeCategory, lang: Lang): string {
  return vi.recipeCategoryLabels[category][lang];
}

export function getDifficultyLabel(difficulty: en.BabyRecipe['difficulty'], lang: Lang): string {
  return vi.recipeDifficultyLabels[difficulty][lang];
}
