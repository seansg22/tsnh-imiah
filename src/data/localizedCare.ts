import type { Lang } from '../i18n/langContext';
import type { CareTips } from '../types';
import { getCareTips, getSoothingLabel } from './careTips';
import { getCareTipsVi, getSoothingLabelVi } from './vi/careTips';
import { momStages, painAreas, type MomStage, type PainArea } from './momCare';
import { momStagesVi, painAreasVi } from './vi/momCare';

export function getLocalizedCareTips(week: number, lang: Lang): CareTips {
  return lang === 'vi' ? getCareTipsVi(week) : getCareTips(week);
}

export function getLocalizedSoothingLabel(week: number, lang: Lang): string {
  return lang === 'vi' ? getSoothingLabelVi(week) : getSoothingLabel(week);
}

const momStagesViFull: MomStage[] = momStages.map(s => ({ ...s, ...momStagesVi[s.from] }));

export function getMomStages(lang: Lang): MomStage[] {
  return lang === 'vi' ? momStagesViFull : momStages;
}

export function getLocalizedMomStage(week: number, lang: Lang): MomStage {
  const list = getMomStages(lang);
  return [...list].reverse().find(s => s.from <= week) ?? list[0];
}

const painAreasViFull: Record<string, PainArea> = Object.fromEntries(
  Object.entries(painAreas).map(([k, v]) => [k, { ...v, ...painAreasVi[k] }]),
);

export function getPainAreas(lang: Lang): Record<string, PainArea> {
  return lang === 'vi' ? painAreasViFull : painAreas;
}
