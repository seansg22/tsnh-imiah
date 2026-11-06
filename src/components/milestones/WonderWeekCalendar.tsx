import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isBefore, startOfDay, addDays, parseISO, format, getDay, differenceInWeeks,
} from 'date-fns';
import type { Leap } from '../../data/wonderWeeks';
import { getLeaps } from '../../data/localized';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';
import { cardShadow } from '../shared/cardStyle';

interface Props {
  /** Estimated due date (ISO "YYYY-MM-DD") — Wonder Week leaps are counted from here, not birth date. */
  eddDate: string;
}

const cardShadowSm = 'shadow-[0_2px_6px_rgba(155,123,110,0.15)]';

const LEAP_BG: Record<1 | 2 | 3, string> = {
  1: 'bg-red-100',
  2: 'bg-red-200',
  3: 'bg-red-300',
};

export function WonderWeekCalendar({ eddDate }: Props) {
  const { dispatch } = useApp();
  const { t, lang } = useLang();
  const weekdays = Array.from({ length: 7 }, (_, i) => formatDate(new Date(2023, 0, 1 + i), 'EEE', lang));
  const [viewMonth, setViewMonth] = useState(() => new Date());

  // Wonder Week leaps are driven by the estimated due date (EDD), not the
  // birth date — leap timing tracks gestational/adjusted age.
  const edd = useMemo(() => parseISO(eddDate), [eddDate]);

  const leapDays = useMemo(() => {
    const leapDaysMap = new Map<string, Leap>();
    for (const leap of getLeaps(lang)) {
      const start = addDays(edd, leap.startWeek * 7);
      const end = addDays(edd, leap.endWeek * 7 + 6);
      const days = eachDayOfInterval({ start, end });
      for (const d of days) {
        leapDaysMap.set(format(d, 'yyyy-MM-dd'), leap);
      }
    }
    return leapDaysMap;
  }, [edd, lang]);

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const interval = eachDayOfInterval({ start, end });
    const padStart = getDay(start);
    return [...Array(padStart).fill(null), ...interval] as (Date | null)[];
  }, [viewMonth]);

  const today = new Date();

  // Defaults to today; tapping a day shows that day's wonder week info instead.
  // Switching month clears the tapped day, unless that month is the current one,
  // in which case today gets auto-tapped again.
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => new Date());
  const selectedLeap = selectedDay ? (leapDays.get(format(selectedDay, 'yyyy-MM-dd')) ?? null) : null;

  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);

  function goToMonth(newMonth: Date) {
    setSlideDir(newMonth > viewMonth ? 'next' : newMonth < viewMonth ? 'prev' : null);
    setViewMonth(newMonth);
    setSelectedDay(isSameMonth(newMonth, today) ? new Date() : null);
  }
  function prevMonth() {
    goToMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    goToMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 40;

  const suppressClick = useRef(false);

  function onGridPointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX, y: e.clientY };
  }
  function onGridPointerUp(e: React.PointerEvent) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      suppressClick.current = true;
      if (dx < 0) nextMonth(); else prevMonth();
    }
  }

  return (
    <div className="fade-in px-4 pt-6 pb-4">
      <style>{`
        @keyframes month-in-next {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes month-in-prev {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .month-in-next { animation: month-in-next 0.26s cubic-bezier(0.32,0.72,0,1) forwards; }
        .month-in-prev { animation: month-in-prev 0.26s cubic-bezier(0.32,0.72,0,1) forwards; }
      `}</style>
      {/* Title */}
      <h1 className="text-2xl font-extrabold text-app-text">{t('cal.title')}</h1>
      <p className="text-sm text-textMuted mt-1 mb-4 flex flex-wrap items-center gap-1">
        {t('cal.basedOn')}
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', payload: 'babyprofile' })}
          className="inline-flex items-center gap-0.5 font-bold text-peachDark active:opacity-70 transition-opacity"
        >
          ({formatDate(edd, lang === 'vi' ? 'd MMM yyyy' : 'MMM d, yyyy', lang)})
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </p>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} aria-label="prev" className={`w-9 h-9 rounded-full bg-white flex items-center justify-center text-peachDark active:scale-90 transition-transform ${cardShadow}`}>
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-extrabold leading-none text-app-text capitalize">{formatDate(viewMonth, 'MMMM yyyy', lang)}</span>
          {(viewMonth.getMonth() !== today.getMonth() || viewMonth.getFullYear() !== today.getFullYear()) && (
            <button
              onClick={() => goToMonth(new Date())}
              className="text-[10px] font-bold text-white bg-peach px-2.5 py-0.5 rounded-full active:scale-95 transition-transform"
            >
              {t('cal.backToToday')}
            </button>
          )}
        </div>
        <button onClick={nextMonth} aria-label="next" className={`w-9 h-9 rounded-full bg-white flex items-center justify-center text-peachDark active:scale-90 transition-transform ${cardShadow}`}>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="overflow-x-clip">
        {/* Weekday labels: the weekend is peach */}
        <div className="grid grid-cols-7 mb-1">
          {weekdays.map((d, i) => (
            <div key={i} className={`text-center text-[10px] font-extrabold py-1 ${i === 0 || i === 6 ? 'text-peachDark' : 'text-textMuted'}`}>{d}</div>
          ))}
        </div>

        {/* Day grid: every day is a soft tile, leap days are pink (darker = stronger), past days fade, today is a peach tile */}
        <div
          key={format(viewMonth, 'yyyy-MM')}
          className={`grid grid-cols-7 gap-1.5 py-2 touch-pan-y select-none ${
            slideDir === 'next' ? 'month-in-next' : slideDir === 'prev' ? 'month-in-prev' : ''
          }`}
          onPointerDown={onGridPointerDown}
          onPointerUp={onGridPointerUp}
        >
          {days.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />;
            const key = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const leap = leapDays.get(key);
            const wonderWeek = differenceInWeeks(day, edd);
            // the week label only shows when the wonder week changes (and on the 1st), not on every day
            const prevDay = i > 0 ? days[i - 1] : null;
            const showWeek = wonderWeek >= 0 && (!prevDay || differenceInWeeks(prevDay, edd) !== wonderWeek);
            const isPast = !isToday && isBefore(day, startOfDay(today));
            const tile = isToday
              ? 'bg-peach text-white shadow-[0_6px_14px_rgba(232,135,90,0.5)]'
              : leap ? `${LEAP_BG[leap.level]} text-red-900` : `bg-white text-app-text ${cardShadowSm}`;

            return (
              <button
                key={key}
                onClick={() => {
                  if (suppressClick.current) { suppressClick.current = false; return; }
                  setSelectedDay(day);
                }}
                className={`relative h-12 rounded-2xl flex flex-col items-center justify-center transition-transform active:scale-90 ${tile} ${isPast ? 'opacity-55' : ''} ${isSelected ? 'ring-2 ring-inset ring-peachDark' : ''}`}
              >
                <span className="text-sm font-bold leading-none">{format(day, 'd')}</span>
                <span className={`mt-1 h-2 text-[8px] leading-none font-semibold ${isToday ? 'text-white/80' : 'text-textMuted'}`}>{showWeek ? `w${wonderWeek}` : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 px-1">
        <div className="flex items-center gap-1">
          <span className="w-4 h-2.5 rounded-full bg-red-100" />
          <span className="w-4 h-2.5 rounded-full bg-red-200" />
          <span className="w-4 h-2.5 rounded-full bg-red-300" />
          <span className="text-[11px] text-textMuted ml-0.5">{t('cal.legend')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-peach" />
          <span className="text-[11px] text-textMuted">{t('cal.today')}</span>
        </div>
      </div>

      {/* Tapped day's wonder week panel — shown only if that day falls in a leap */}
      {selectedDay && selectedLeap && (
        <div className="mt-4">
          <div className={`bg-red-100 rounded-2xl px-4 py-4 mb-4 ${cardShadow}`}>
            <p className="text-base font-bold text-red-800 mb-1.5">
              {t('cal.wonderWeek', { n: selectedLeap.number, name: selectedLeap.name })}
            </p>
            <p className="text-sm text-red-700 leading-relaxed">{selectedLeap.description}</p>
          </div>
          <div className={`bg-orange-100 rounded-2xl px-4 py-4 ${cardShadow}`}>
            <p className="text-base font-bold text-app-text mb-3">{t('cal.tips')}</p>
            <div className="flex flex-col gap-3">
              {selectedLeap.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peachDark flex-shrink-0" />
                  <p className="text-sm text-app-text leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
