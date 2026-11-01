import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { milestones } from '../data/weeklyDevelopment';
import { getFeeding } from '../constants/babyDefaults';
import { MAX_WEEK, percentileOfZ, zScoreOf, type GrowthMetric } from '../data/whoGrowthData';
import type { Lang } from '../i18n/langContext';
import { solidsOf } from './solids';
import type { AppState, MilkFields } from '../types';

export type AdviceKind = 'growth' | 'fooddiary' | 'milestones';

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
    const milk = (m: MilkFields, when: string) => [
      m.momTimes !== undefined && `${when} mom's milk ${m.momTimes}x${m.momMl !== undefined ? ` of ${m.momMl} ml` : ''}${m.momWays?.length ? ` (${m.momWays.map(w => (w === 'breast' ? 'breastfed' : 'from bottle')).join(' + ')})` : ''}`,
      m.formulaTimes !== undefined && `${when} formula ${m.formulaTimes}x${m.formulaMl !== undefined ? ` of ${m.formulaMl} ml` : ''}`,
    ];
    const parts = [
      ...milk(e, 'daytime'),
      ...(e.night ? milk(e.night, 'night') : []),
      ...solidsOf(e).map((m, i) => `${m.snack ? 'snack' : 'solid'} ${i + 1}: ${m.foods.join(', ')}${m.portion ? ` (${m.portion})` : ''}`),
      e.poop && `poop ${[e.poop.times !== undefined && `${e.poop.times}x`, e.poop.colors?.join('/'), e.poop.textures?.join('/')].filter(Boolean).join(', ')}`,
      e.allergy?.length && `reactions: ${e.allergy.join(', ')}`,
    ].filter(Boolean);
    return `- ${e.date}: ${parts.join('; ')}`;
  });
  return rows.length ? rows.join('\n') : 'No food diary entries yet.';
}

function milestoneData(state: AppState): string {
  const week = differenceInWeeks(new Date(), parseISO(state.babyProfile!.birthDate));
  const done = new Set(state.achievedMilestones);
  const line = (m: (typeof milestones)[number]) => `- [${m.category}] ${m.label} (weeks ${m.weekRange[0]}-${m.weekRange[1]})`;
  const section = (title: string, list: typeof milestones) => `${title}:\n${list.length ? list.map(line).join('\n') : '- none'}`;
  return [
    section('Achieved', milestones.filter(m => done.has(m.id))),
    section('Overdue (expected window passed, not achieved)', milestones.filter(m => !done.has(m.id) && m.weekRange[1] <= week)),
    section('Coming up (starts within 8 weeks)', milestones.filter(m => !done.has(m.id) && m.weekRange[0] > week - 1 && m.weekRange[0] <= week + 8)),
  ].join('\n\n');
}

// Hardcoded on purpose: the user cannot change what is asked.
export function buildAdvicePrompt(kind: AdviceKind, state: AppState, lang: Lang) {
  const topic = { growth: 'growth (weight, length, head circumference)', fooddiary: 'feeding and food diary', milestones: 'developmental milestones' }[kind];
  const system = `You are a careful baby development assistant.
Rules:
- Always answer in ${lang === 'vi' ? 'Vietnamese, warm and a little cute but not over the top' : 'English'}.
- Review the baby's ${topic} data and give: 1) the current situation, 2) next steps.
- Use two short sections with bullet points, 2 to 4 bullets each, one concise sentence per bullet.
- Be practical and age-aware. If something may need a doctor, say so gently.`;
  const data = { growth: growthData, fooddiary: foodData, milestones: milestoneData }[kind](state);
  const heading = { growth: 'Growth entries', fooddiary: 'Recent food diary (up to 14 days)', milestones: 'Milestones' }[kind];
  const user = `${babyInfo(state)}\n\n${heading}:\n${data}\n\nWhat is the current situation and what should we do next?`;
  return { system, user };
}
