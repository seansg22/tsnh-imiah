import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { getFeeding } from '../constants/babyDefaults';
import { MAX_WEEK, percentileOfZ, zScoreOf, type GrowthMetric } from '../data/whoGrowthData';
import type { Lang } from '../i18n/langContext';
import type { AppState } from '../types';

export type AdviceKind = 'growth' | 'fooddiary';

function babyInfo(state: AppState): string {
  const baby = state.babyProfile!;
  const feeding = getFeeding(baby);
  const milkLabel = { mom: "mom's breast milk", formula: 'formula' };
  const wayLabel = { direct: 'directly from the breast', bottle: 'bottle' };
  const ways = [...feeding.ways.map(w => wayLabel[w]), feeding.other.trim()].filter(Boolean).join(', ');
  const solids = baby.solidsStartDate
    ? `Started solids ${differenceInWeeks(new Date(), parseISO(baby.solidsStartDate))} weeks ago`
    : 'Not started solids yet';
  return [
    `Baby: ${baby.name}`,
    `Age: ${differenceInWeeks(new Date(), parseISO(baby.birthDate))} weeks (born ${baby.birthDate})`,
    `Gender: ${baby.gender}`,
    `Milk: ${feeding.milk.map(m => milkLabel[m]).join(' + ')}${ways ? `, fed by ${ways}` : ''}`,
    `Solids: ${solids}`,
    baby.notes?.trim() && `Parent's notes: ${baby.notes.trim()}`,
  ].filter(Boolean).join('\n');
}

function growthData(state: AppState): string {
  const baby = state.babyProfile!;
  const rows = [...state.growthEntries].sort((a, b) => a.date.localeCompare(b.date)).map(e => {
    const week = differenceInDays(parseISO(e.date), parseISO(baby.birthDate)) / 7;
    const parts = (['weight', 'length', 'head'] as GrowthMetric[]).flatMap(m => {
      const v = e[m];
      if (v === undefined) return [];
      const unit = m === 'weight' ? 'kg' : 'cm';
      const p = week >= 0 && week <= MAX_WEEK ? `, WHO P${Math.round(percentileOfZ(zScoreOf(m, week, baby.gender, v)))}` : '';
      return [`${m} ${v} ${unit}${p}`];
    });
    return `- ${e.date}: ${parts.join('; ')}`;
  });
  return rows.length ? rows.join('\n') : 'No growth entries yet.';
}

function foodData(state: AppState): string {
  const rows = [...state.foodEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).reverse().map(e => {
    const parts = [
      e.momTimes !== undefined && `breastfeeds ${e.momTimes}x`,
      e.formulaTimes !== undefined && `formula ${e.formulaTimes}x${e.formulaMl !== undefined ? ` of ${e.formulaMl} ml` : ''}`,
      e.solidTimes !== undefined && `solid meals ${e.solidTimes}x`,
      e.foods?.length && `foods: ${e.foods.join(', ')}`,
      e.portion && `portion: ${e.portion}`,
      e.allergy?.length && `reactions: ${e.allergy.join(', ')}`,
    ].filter(Boolean);
    return `- ${e.date}: ${parts.join('; ')}`;
  });
  return rows.length ? rows.join('\n') : 'No food diary entries yet.';
}

// Hardcoded on purpose: the user cannot change what is asked.
export function buildAdvicePrompt(kind: AdviceKind, state: AppState, lang: Lang) {
  const topic = kind === 'growth' ? 'growth (weight, length, head circumference)' : 'feeding and food diary';
  const system = `You are a careful baby development assistant.
Rules:
- Always answer in ${lang === 'vi' ? 'Vietnamese, warm and a little cute but not over the top' : 'English'}.
- Review the baby's ${topic} data and give: 1) the current situation, 2) next steps.
- Use two short sections with bullet points, 2 to 4 bullets each, one concise sentence per bullet.
- Be practical and age-aware. If something may need a doctor, say so gently.`;
  const data = kind === 'growth' ? growthData(state) : foodData(state);
  const user = `${babyInfo(state)}\n\n${kind === 'growth' ? 'Growth entries' : 'Recent food diary (up to 14 days)'}:\n${data}\n\nWhat is the current situation and what should we do next?`;
  return { system, user };
}
