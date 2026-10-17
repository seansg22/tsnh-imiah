import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Brain, Heart, Eye } from 'lucide-react';
import { useLang, type LangState } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { useApp } from '../../context/appStateContext';
import { getWeekData, getInsightExplanationFor } from '../../data/localized';
import { definedWeeks } from '../../data/weeklyDevelopment';
import { useBabyAge } from '../../hooks/useBabyAge';

type Category = 'motor' | 'cognitive' | 'social' | 'sensory';

const categoryConfig: { key: Category; label: UiKey; Icon: React.FC<{ size?: number; strokeWidth?: number }>; color: string }[] = [
  { key: 'motor',     label: 'cat.motor',     Icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
  { key: 'cognitive', label: 'cat.cognitive', Icon: Brain,    color: 'bg-blue-100 text-blue-600'     },
  { key: 'social',    label: 'cat.social',    Icon: Heart,    color: 'bg-pink-100 text-pink-600'     },
  { key: 'sensory',   label: 'cat.sensory',   Icon: Eye,      color: 'bg-purple-100 text-purple-600' },
];

function formatWeekLabel(week: number, t: LangState['t']): string {
  if (week <= 52) return t('wk.week', { n: week });
  const yrs = Math.floor(week / 52);
  const wks = week % 52;
  if (wks === 0) return t(yrs !== 1 ? 'wk.years' : 'wk.year', { n: yrs });
  return t('wk.yrWk', { y: yrs, w: wks });
}

export function InsightsScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const { currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const [activeCategory, setActiveCategory] = useState<Category>('motor');
  const stickyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    if (contentRef.current) {
      const top = contentRef.current.getBoundingClientRect().top + window.scrollY;
      const offset = stickyRef.current?.offsetHeight ?? 0;
      window.scrollTo({ top: top - offset, behavior: 'smooth' });
    }
  }

  // ponytail: seed selectedWeek to currentWeek on first load (state initializes to 0)
  useEffect(() => {
    if (state.selectedWeek === 0 && currentWeek > 0) {
      dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek });
    }
  }, [currentWeek]);

  const selectedWeek = state.selectedWeek === 0 ? currentWeek : state.selectedWeek;
  const data = getWeekData(lang, selectedWeek);

  function changeWeek(delta: number) {
    const currentIdx = definedWeeks.findIndex(w => w >= selectedWeek);
    const effectiveIdx = definedWeeks[currentIdx] === selectedWeek ? currentIdx : Math.max(0, currentIdx - 1);
    const nextIdx = Math.max(0, Math.min(definedWeeks.length - 1, effectiveIdx + delta));
    dispatch({ type: 'SET_SELECTED_WEEK', payload: definedWeeks[nextIdx] });
  }

  const items = data[activeCategory];

  return (
    <div className="fade-in">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-app-text">{t('ins.title')}</h1>

        {/* Week selector */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => changeWeek(-1)}
            disabled={selectedWeek <= definedWeeks[0]}
            className="w-9 h-9 rounded-full bg-peachLight text-peachDark disabled:opacity-30 flex items-center justify-center"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-extrabold text-app-text">{formatWeekLabel(selectedWeek, t)}</p>
            <button
              onClick={() => selectedWeek !== currentWeek && dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek })}
              className={`text-xs font-semibold ${selectedWeek === currentWeek ? 'text-peachDark cursor-default' : 'text-textMuted underline underline-offset-2'}`}
            >
              {selectedWeek === currentWeek ? t('ins.current') : t('ins.browsing')}
            </button>
          </div>
          <button
            onClick={() => changeWeek(1)}
            disabled={selectedWeek >= definedWeeks[definedWeeks.length - 1]}
            className="w-9 h-9 rounded-full bg-peachLight text-peachDark disabled:opacity-30 flex items-center justify-center"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 bg-peachLight rounded-2xl p-4">
        <p className="font-bold text-app-text text-sm mb-1">{data.title}</p>
        <p className="text-textMuted text-xs leading-relaxed">{data.summary}</p>
      </div>

      {/* Category tabs */}
      <div ref={stickyRef} className="sticky top-0 z-10 bg-cream flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar overscroll-x-contain"
        onWheel={e => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}
      >
        {categoryConfig.map(({ key, label, Icon, color }) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === key ? color : 'bg-warm text-textMuted'
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>

      {/* Detail cards */}
      <div ref={contentRef} className="px-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-peach mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-app-text font-bold leading-snug">{item}</p>
              <p className="mt-1 text-xs text-textMuted font-medium leading-relaxed">
                {getInsightExplanationFor(lang, activeCategory, i, selectedWeek)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pb-6" />
    </div>
  );
}
