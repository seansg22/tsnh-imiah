import { Sparkles } from 'lucide-react';
import { cardShadow } from '../shared/cardStyle';
import { useLang, type LangState } from '../../i18n/langContext';

interface AgeDisplayProps {
  summary: string;
  weeks: number;
  days: number;
  years: number;
  remainingWeeks: number;
  selectedWeek: number;
  currentWeek: number;
}

type T = LangState['t'];

function formatCurrentAge(weeks: number, days: number, years: number, remainingWeeks: number, t: T): string {
  const old = (text: string) => t('age.old', { text });
  if (weeks === 0 && days === 0) return t('today.justBorn');
  // Under 1 year: show weeks (+ days while very young)
  if (years === 0) {
    const w = t(weeks !== 1 ? 'age.weeks' : 'age.week', { n: weeks });
    if (days === 0) return old(w);
    return old(`${w}, ${t(days !== 1 ? 'age.days' : 'age.day', { n: days })}`);
  }
  // 1+ year: show years + weeks
  if (remainingWeeks === 0) return old(t(years !== 1 ? 'age.years' : 'age.year', { n: years }));
  return old(`${t(years !== 1 ? 'age.yrs' : 'age.yr', { n: years })}, ${t(remainingWeeks !== 1 ? 'age.wks' : 'age.wk', { n: remainingWeeks })}`);
}

function formatBrowseWeek(week: number, t: T): string {
  if (week <= 52) return t('wk.week', { n: week });
  const yrs = Math.floor(week / 52);
  const wks = week % 52;
  if (wks === 0) return t(yrs !== 1 ? 'wk.years' : 'wk.year', { n: yrs });
  return t('wk.yrWk', { y: yrs, w: wks });
}

export function AgeDisplay({ summary, weeks, days, years, remainingWeeks, selectedWeek, currentWeek }: AgeDisplayProps) {
  const { t } = useLang();
  const isCurrent = selectedWeek === currentWeek;
  const ageText = isCurrent
    ? formatCurrentAge(weeks, days, years, remainingWeeks, t)
    : formatBrowseWeek(selectedWeek, t);

  return (
    <div className="px-4 pb-2">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFAB76] to-[#E8875A] p-5 text-center ${cardShadow}`}>
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative">
          <span className="inline-flex items-center gap-1 bg-white text-peachDark text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles size={12} strokeWidth={2.5} />
            {isCurrent ? t('hero.thisWeek') : t('age.peeking')}
          </span>
          <p className="text-3xl font-extrabold text-white mt-3">{ageText}</p>
          {/* 7 dots = days of the current week: done, today, to come */}
          {isCurrent && (
            <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < days ? 'bg-white' : i === days ? 'ring-2 ring-white' : 'bg-white/35'
                  }`}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-white leading-relaxed mt-4">{summary}</p>
        </div>
      </div>
    </div>
  );
}
