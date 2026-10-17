import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addDays, parseISO, format, getDay, differenceInWeeks,
} from 'date-fns';
import type { Leap } from '../../data/wonderWeeks';
import { getLeaps } from '../../data/localized';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';

interface Props {
  /** Estimated due date (ISO "YYYY-MM-DD") — Wonder Week leaps are counted from here, not birth date. */
  eddDate: string;
}

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
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-peachLight text-textMuted">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-app-text">{formatDate(viewMonth, 'MMMM yyyy', lang)}</span>
          {(viewMonth.getMonth() !== today.getMonth() || viewMonth.getFullYear() !== today.getFullYear()) && (
            <button
              onClick={() => goToMonth(new Date())}
              className="text-[10px] font-semibold text-peachDark bg-peachLight/60 px-2 py-0.5 rounded-full hover:bg-peachLight"
            >
              {t('cal.backToToday')}
            </button>
          )}
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-peachLight text-textMuted">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-textMuted py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="rounded-2xl overflow-hidden border border-peachLight">
      <div
        key={format(viewMonth, 'yyyy-MM')}
        className={`grid grid-cols-7 gap-px bg-peachLight/40 touch-pan-y select-none ${
          slideDir === 'next' ? 'month-in-next' : slideDir === 'prev' ? 'month-in-prev' : ''
        }`}
        onPointerDown={onGridPointerDown}
        onPointerUp={onGridPointerUp}
      >
        {days.map((day, i) => {
          if (!day) {
            return <div key={`pad-${i}`} className="bg-cream min-h-[44px]" />;
          }
          const key = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const leap = leapDays.get(key);
          const wonderWeek = differenceInWeeks(day, edd);

          return (
            <button
              key={key}
              onClick={() => {
                if (suppressClick.current) { suppressClick.current = false; return; }
                setSelectedDay(day);
              }}
              className={`min-h-[44px] p-1 text-left flex flex-col gap-0.5 transition-colors ${
                leap ? LEAP_BG[leap.level] : 'bg-cream'
              } ${isSelected ? 'ring-2 ring-inset ring-peach' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className="flex items-start justify-between w-full mb-0.5">
                <span className={`text-xs font-bold leading-none w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                  isToday ? 'bg-peach text-white' : 'text-app-text'
                }`}>
                  {format(day, 'd')}
                </span>
                {wonderWeek >= 0 && (
                  <span className="text-[8px] text-textMuted leading-none font-medium">w{wonderWeek}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
          <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-300" />
          <span className="w-3 h-3 rounded-sm bg-red-300 border border-red-400" />
          <span className="text-[10px] text-textMuted ml-0.5">{t('cal.legend')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-peach" />
          <span className="text-[10px] text-textMuted">{t('cal.today')}</span>
        </div>
      </div>

      {/* Tapped day's wonder week panel — shown only if that day falls in a leap */}
      {selectedDay && selectedLeap && (
        <div className="mt-4">
          <div className="bg-red-100 rounded-2xl px-4 py-4 mb-3">
            <p className="text-base font-bold text-red-800 mb-1.5">
              {t('cal.wonderWeek', { n: selectedLeap.number, name: selectedLeap.name })}
            </p>
            <p className="text-sm text-red-700 leading-relaxed">{selectedLeap.description}</p>
          </div>
          <div className="bg-warm rounded-2xl px-4 py-4">
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
