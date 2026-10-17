import { useState } from 'react';
import { useLang } from '../../i18n/langContext';
import { formatDate as formatLocaleDate } from '../../i18n/date';

/**
 * DateInput — custom date picker using three <select> elements.
 * Replaces <input type="date"> to avoid iOS Safari's native widget
 * overflowing its container regardless of CSS constraints.
 *
 * Props:
 *   value   – YYYY-MM-DD string (or empty string)
 *   onChange – called with YYYY-MM-DD whenever any part changes
 *   min     – optional YYYY-MM-DD lower bound
 *   max     – optional YYYY-MM-DD upper bound
 */

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface DateInputProps {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  compact?: boolean;
}

const selectClass =
  'flex-1 min-w-0 rounded-xl border-2 border-peachLight bg-cream ' +
  'px-2 outline-none transition-colors focus:border-peach appearance-none text-center';

// Placeholder ("Month"/"Day"/"Year") renders light grey; a real selection renders bold app-text.
function valueClass(selected: number) {
  return selected ? 'text-app-text font-semibold' : 'text-textMuted/50 font-normal';
}

export function DateInput({ value, onChange, min, max, compact }: DateInputProps) {
  const { t, lang } = useLang();
  const monthNames = Array.from({ length: 12 }, (_, i) => formatLocaleDate(new Date(2000, i, 1), 'MMMM', lang))
    .map(n => n.charAt(0).toUpperCase() + n.slice(1)); // vi locale gives lowercase "tháng 04"
  const parsed = parseDate(value);
  const minParsed = parseDate(min ?? '');
  const maxParsed = parseDate(max ?? '');

  const today = new Date();
  const minYear = minParsed?.year ?? today.getFullYear() - 5;
  const maxYear = maxParsed?.year ?? today.getFullYear();

  // Build year options (most recent first so newest babies appear at top)
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  // Keep partial picks locally; parent only gets a value once all three parts are set.
  const [parts, setParts] = useState({ year: parsed?.year ?? 0, month: parsed?.month ?? 0, day: parsed?.day ?? 0 });
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setParts({ year: parsed?.year ?? 0, month: parsed?.month ?? 0, day: parsed?.day ?? 0 });
  }
  const selectedYear = parts.year;
  const selectedMonth = parts.month;
  const selectedDay = parts.day;

  const dayCount = selectedYear && selectedMonth
    ? daysInMonth(selectedYear, selectedMonth)
    : 31;

  function emit(year: number, month: number, day: number) {
    const maxDay = year && month ? daysInMonth(year, month) : 31;
    const clamped = day ? Math.min(day, maxDay) : 0;
    setParts({ year, month, day: clamped });
    if (!year || !month || !clamped) return;
    const next = formatDate(year, month, clamped);
    setPrevValue(next);
    onChange(next);
  }

  const sizeClass = compact ? 'py-2 text-sm' : 'py-3 text-sm';

  return (
    <div className="flex gap-2 w-full">
      {/* Month */}
      <select
        value={selectedMonth || ''}
        onChange={e => emit(selectedYear, Number(e.target.value), selectedDay)}
        className={`${selectClass} ${sizeClass} ${valueClass(selectedMonth)}`}
        style={{ WebkitAppearance: 'none' }}
      >
        <option value="" disabled>{t('date.month')}</option>
        {monthNames.map((name, i) => (
          <option key={name} value={i + 1}>{name}</option>
        ))}
      </select>

      {/* Day */}
      <select
        value={selectedDay || ''}
        onChange={e => emit(selectedYear, selectedMonth, Number(e.target.value))}
        className={`${selectClass} ${sizeClass} max-w-[72px] ${valueClass(selectedDay)}`}
        style={{ WebkitAppearance: 'none' }}
      >
        <option value="" disabled>{t('date.day')}</option>
        {Array.from({ length: dayCount }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Year */}
      <select
        value={selectedYear || ''}
        onChange={e => emit(Number(e.target.value), selectedMonth, selectedDay)}
        className={`${selectClass} ${sizeClass} max-w-[90px] ${valueClass(selectedYear)}`}
        style={{ WebkitAppearance: 'none' }}
      >
        <option value="" disabled>{t('date.year')}</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
