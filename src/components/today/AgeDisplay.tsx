import { useLang, type LangState } from '../../i18n/langContext';

interface AgeDisplayProps {
  name: string;
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

export function AgeDisplay({ name, weeks, days, years, remainingWeeks, selectedWeek, currentWeek }: AgeDisplayProps) {
  const { t } = useLang();
  const isCurrent = selectedWeek === currentWeek;
  const ageText = isCurrent
    ? formatCurrentAge(weeks, days, years, remainingWeeks, t)
    : formatBrowseWeek(selectedWeek, t);

  return (
    <div className="text-center px-4 pb-2 mb-5">
      <p className="text-2xl font-extrabold text-peachDark">{ageText}</p>
      <p className="text-textMuted text-sm font-semibold mt-0.5">
        {isCurrent ? t('age.ourLittle', { name }) : t('age.peeking')}
      </p>
    </div>
  );
}
