interface AgeDisplayProps {
  name: string;
  weeks: number;
  days: number;
  years: number;
  remainingWeeks: number;
  selectedWeek: number;
  currentWeek: number;
}

function formatCurrentAge(weeks: number, days: number, years: number, remainingWeeks: number): string {
  if (weeks === 0 && days === 0) return 'just born!';
  // Under 1 year — show weeks (+ days while very young)
  if (years === 0) {
    if (days === 0) return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
    return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''} old`;
  }
  // 1+ year — show years + weeks
  if (remainingWeeks === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
  return `${years} yr${years !== 1 ? 's' : ''}, ${remainingWeeks} wk${remainingWeeks !== 1 ? 's' : ''} old`;
}

function formatBrowseWeek(week: number): string {
  if (week <= 52) return `Week ${week}`;
  const yrs = Math.floor(week / 52);
  const wks = week % 52;
  if (wks === 0) return `${yrs} year${yrs !== 1 ? 's' : ''}`;
  return `${yrs} yr ${wks} wk`;
}

export function AgeDisplay({ name, weeks, days, years, remainingWeeks, selectedWeek, currentWeek }: AgeDisplayProps) {
  const isCurrent = selectedWeek === currentWeek;
  const ageText = isCurrent
    ? formatCurrentAge(weeks, days, years, remainingWeeks)
    : formatBrowseWeek(selectedWeek);

  return (
    <div className="text-center px-4 pb-2 mb-5">
      <p className="text-2xl font-extrabold text-peachDark">{ageText}</p>
      <p className="text-textMuted text-sm font-semibold mt-0.5">
        {isCurrent ? `Our little ${name}, growing sweeter every day` : 'Peeking at another week'}
      </p>
    </div>
  );
}
