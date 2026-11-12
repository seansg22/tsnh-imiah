import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { milestones } from '../data/weeklyDevelopment';
import { isOverdue } from './milestones';
import { getFeeding } from '../constants/babyDefaults';
import { MAX_WEEK, percentileOfZ, zScoreOf, type GrowthMetric } from '../data/whoGrowthData';
import type { Lang } from '../i18n/langContext';
import { solidsOf } from './solids';
import { formatDuration, groupByDay, sleepMinutes } from './sleep';
import { milkTotals } from './milkTotal';
import { dayMilksOf } from './dayMilks';
import { foldTimes } from './foodForm';
import type { AppState, MilkFields, SleepEntry } from '../types';

export type AdviceKind = 'growth' | 'fooddiary' | 'milestones' | 'sleep' | 'diary'; // diary = food and sleep together

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

export function sleepData(state: AppState): string {
  const rows = groupByDay(state.sleepEntries).slice(0, 14).reverse().map(d => {
    const one = (e: SleepEntry) =>
      [
        `${e.start}-${e.end} (${formatDuration(sleepMinutes(e.start, e.end))})`,
        e.fallAsleepMin !== undefined && `took ${e.fallAsleepMin} min to fall asleep`,
        e.wakeUps !== undefined && `woke ${e.wakeUps}x`,
        e.wakeFeed && `fed when waking${e.wakeFeedMin !== undefined ? ` for ${e.wakeFeedMin} min` : ''}`,
        e.fellAsleep?.length && `fell asleep: ${e.fellAsleep.join(' + ')}`,
      ].filter(Boolean).join(', ');
    const parts = [
      d.naps.length && `naps ${formatDuration(d.napMin)}: ${d.naps.map(one).join('; ')}`,
      d.nights.length && `night ${formatDuration(d.nightMin)}: ${d.nights.map(one).join('; ')}`,
    ].filter(Boolean);
    return `- ${d.date}: ${parts.join(' | ')} | total ${formatDuration(d.totalMin)}`;
  });
  return rows.length ? rows.join('\n') : 'No sleep entries yet.';
}

export function foodData(state: AppState): string {
  const rows = [...state.foodEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).reverse().map(e => {
    const amount = (ml?: number, times?: number) => (ml !== undefined ? ` ${ml} ml` : ` ${times}x`);
    const milk = (raw: MilkFields, when: string) => {
      const m = foldTimes(raw);
      return [
        (m.momMl !== undefined || m.momTimes !== undefined) && `${when} mom's milk${amount(m.momMl, m.momTimes)}${m.momWays?.length ? ` (${m.momWays.map(w => (w === 'breast' ? 'breastfed' : 'from bottle')).join(' + ')})` : ''}`,
        (m.formulaMl !== undefined || m.formulaTimes !== undefined) && `${when} formula${amount(m.formulaMl, m.formulaTimes)}`,
      ];
    };
    const parts = [
      ...dayMilksOf(e).flatMap(m => milk(m, 'daytime')),
      ...(e.night ? milk(e.night, 'night') : []),
      milkTotals(e).all.ml > 0 && `total milk ${milkTotals(e).all.ml}${milkTotals(e).all.complete ? '' : '+'} ml (daytime ${milkTotals(e).day.ml}, night ${milkTotals(e).night.ml})`,
      ...solidsOf(e).map((m, i) => `${m.snack ? 'snack' : 'solid'} ${i + 1}: ${m.foods.join(', ')}${m.portion ? ` (${m.portion})` : ''}`),
      e.poop && `poop ${[e.poop.times !== undefined && `${e.poop.times}x`, e.poop.colors?.join('/'), e.poop.textures?.join('/'), e.poop.note].filter(Boolean).join(', ')}`,
      e.allergy?.length && `reactions: ${e.allergy.join(', ')}`,
    ].filter(Boolean);
    return `- ${e.date}: ${parts.join('; ')}`;
  });
  return rows.length ? rows.join('\n') : 'No food diary entries yet.';
}

function milestoneData(state: AppState): string {
  const week = differenceInWeeks(new Date(), parseISO(state.babyProfile!.birthDate));
  const done = new Set(state.achievedMilestones);
  const skipped = new Set(state.skippedMilestones);
  const line = (m: (typeof milestones)[number]) => `- [${m.category}] ${m.label} (weeks ${m.weekRange[0]}-${m.weekRange[1]})`;
  const section = (title: string, list: typeof milestones) => `${title}:\n${list.length ? list.map(line).join('\n') : '- none'}`;
  return [
    section('Achieved', milestones.filter(m => done.has(m.id))),
    section('Overdue (expected window passed, not achieved)', milestones.filter(m => isOverdue(m, week, done, skipped))),
    ...(skipped.size ? [section('Skipped on purpose by the family (vaccinations, do not nag)', milestones.filter(m => skipped.has(m.id)))] : []),
    section('Coming up (starts within 8 weeks)', milestones.filter(m => !done.has(m.id) && m.weekRange[0] > week - 1 && m.weekRange[0] <= week + 8)),
  ].join('\n\n');
}

const SLEEP_TRAINING_RULE = `
- Add a third short section called "Sleep training". Say if the baby's age suits it (formal sleep training is not advised before about 4 months, so give soothing and routine tips instead). If it suits, suggest one gentle method to try next, like a steady bedtime routine, putting baby down drowsy but awake, or gradual check-ins.
- Use the diary to judge it: how long baby takes to fall asleep, how baby falls asleep (rocked, fed, carried), night wake-ups and night feeds.`;

// Hardcoded on purpose: the user cannot change what is asked.
export function buildAdvicePrompt(kind: AdviceKind, state: AppState, lang: Lang) {
  const topic = { growth: 'growth (weight, length, head circumference)', fooddiary: 'feeding and food diary', milestones: 'developmental milestones', sleep: 'sleep (naps and night sleep)', diary: 'feeding, food diary and sleep (naps and night sleep)' }[kind];
  const system = `You are a careful baby development assistant.
Rules:
- Always answer in ${lang === 'vi' ? 'Vietnamese, warm and a little cute but not over the top' : 'English'}.
- Review the baby's ${topic} data and give: 1) the current situation, 2) next steps.
- Use two short sections with bullet points, 2 to 4 bullets each, one concise sentence per bullet.
- Be practical and age-aware. If something may need a doctor, say so gently.${kind === 'sleep' || kind === 'diary' ? SLEEP_TRAINING_RULE : ''}`;
  const part = (heading: string, data: string) => `${heading}:\n${data}`;
  const body = {
    growth: () => part('Growth entries', growthData(state)),
    fooddiary: () => part('Recent food diary (up to 14 days)', foodData(state)),
    milestones: () => part('Milestones', milestoneData(state)),
    sleep: () => part('Recent sleep diary (up to 14 days)', sleepData(state)),
    diary: () => `${part('Recent food diary (up to 14 days)', foodData(state))}\n\n${part('Recent sleep diary (up to 14 days)', sleepData(state))}`,
  }[kind]();
  const user = `${babyInfo(state)}\n\n${body}\n\nWhat is the current situation and what should we do next?`;
  return { system, user };
}
