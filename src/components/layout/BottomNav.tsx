import { Home, Star, Sparkles, TrendingUp, Settings, Baby, CalendarDays, Compass, UserRound, Utensils, Milk, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { milestones } from '../../data/weeklyDevelopment';
import { isOverdue } from '../../lib/milestones';
import { useBabyAge } from '../../hooks/useBabyAge';
import type { Page } from '../../types';

const homeOptions: { page: Page; icon: React.ElementType; label: UiKey }[] = [
  { page: 'today',    icon: Home,         label: 'nav.today'    },
  { page: 'insights', icon: Sparkles,     label: 'nav.insights' },
  { page: 'food',     icon: Utensils,     label: 'nav.food'     },
  { page: 'mom',      icon: Heart,        label: 'nav.mom'      },
];

const progressOptions: { page: Page; icon: React.ElementType; label: UiKey }[] = [
  { page: 'babyprofile', icon: UserRound,  label: 'nav.babyProfile' },
  { page: 'milestones',  icon: Star,       label: 'nav.milestones'   },
  { page: 'growth',      icon: TrendingUp, label: 'nav.growth'       },
  { page: 'fooddiary',  icon: Milk,       label: 'nav.diary'        }, // also covers 'sleep'
  { page: 'wonderweek',  icon: CalendarDays, label: 'nav.wonderWeek' },
];

const tab = (active: boolean) =>
  `w-full h-full flex flex-col items-center justify-center gap-0.5 px-3 rounded-full text-[11px] leading-tight font-semibold transition-colors ${
    active ? 'text-peachDark bg-peachLight/60' : 'text-textMuted'
  }`;

export function BottomNav() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [showProgress, setShowProgress] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const homeMenuRef = useRef<HTMLDivElement>(null);

  const isProgressActive = state.currentPage === 'milestones' || state.currentPage === 'growth' || state.currentPage === 'fooddiary' || state.currentPage === 'sleep' || state.currentPage === 'babyprofile' || state.currentPage === 'wonderweek';
  const isHomeActive = state.currentPage === 'today' || state.currentPage === 'insights' || state.currentPage === 'food' || state.currentPage === 'mom';
  const { currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const achieved = new Set(state.achievedMilestones);
  const skipped = new Set(state.skippedMilestones);
  const unfinishedMilestones = milestones.filter(m => isOverdue(m, currentWeek, achieved, skipped)).length;

  useEffect(() => {
    if (!showProgress) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProgress(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProgress]);

  useEffect(() => {
    if (!showHome) return;
    function handleClickOutside(e: MouseEvent) {
      if (homeMenuRef.current && !homeMenuRef.current.contains(e.target as Node)) {
        setShowHome(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHome]);

  function navigate(page: Page) {
    setShowProgress(false);
    setShowHome(false);
    dispatch({ type: 'SET_PAGE', payload: page });
  }

  return (
    <>
    <style>{`
      @keyframes popup-appear {
        from { opacity: 0; transform: translateY(8px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .popup-appear {
        animation: popup-appear 0.18s ease-out forwards;
        transform-origin: bottom center;
      }
    `}</style>
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      {/* blur the page content under and around the bar, fading out upward */}
      <div
        className="absolute inset-x-0 -top-3 bottom-0 pointer-events-none backdrop-blur-[3px]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 45%)',
          maskImage: 'linear-gradient(to bottom, transparent, black 45%)',
        }}
      />
      <div className="relative">
        {/* Nav bar */}
        <div className="relative bg-cream border border-peachLight rounded-full shadow-[0_12px_32px_rgba(120,70,40,0.32)] grid grid-cols-4 h-14 p-1.5">
          {/* Left: Home + Progress */}
          <div className="contents">
            <div ref={homeMenuRef} className="relative h-full">
              {showHome && (
                <div className="popup-appear absolute bottom-full mb-4 left-0 flex flex-col items-center gap-1 bg-white border border-peachLight rounded-2xl shadow-lg py-2 px-1 min-w-[140px]">
                  {homeOptions.map(({ page, icon: Icon, label }) => {
                    const isActive = state.currentPage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => navigate(page)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive ? 'text-peachDark bg-peachLight/40' : 'text-textMuted hover:text-peachDark'
                        }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span>{t(label)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setShowHome(v => !v)}
                className={tab(isHomeActive)}
              >
                <Compass size={20} strokeWidth={isHomeActive ? 2.5 : 1.8} />
                <span>{t('nav.explore')}</span>
              </button>
            </div>

            <div ref={menuRef} className="relative h-full">
              {showProgress && (
                <div className="popup-appear absolute bottom-full mb-4 left-0 flex flex-col items-center gap-1 bg-white border border-peachLight rounded-2xl shadow-lg py-2 px-1 min-w-[140px]">
                  {progressOptions.map(({ page, icon: Icon, label }) => {
                    const isActive = state.currentPage === page || (page === 'fooddiary' && state.currentPage === 'sleep');
                    return (
                      <button
                        key={page}
                        onClick={() => navigate(page)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive ? 'text-peachDark bg-peachLight/40' : 'text-textMuted hover:text-peachDark'
                        }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span>{t(label)}</span>
                        {page === 'milestones' && unfinishedMilestones > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-peachLight text-peachDark text-xs font-bold rounded-full flex items-center justify-center leading-none">
                            {unfinishedMilestones > 99 ? '99+' : unfinishedMilestones}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setShowProgress(v => !v)}
                className={tab(isProgressActive)}
              >
                <Baby size={20} strokeWidth={isProgressActive ? 2.5 : 1.8} />
                <span className="max-w-full truncate">{state.babyProfile?.name?.trim() || t('nav.baby')}</span>
              </button>
            </div>
          </div>

          {/* Right tabs: Mom + Settings */}
          <div className="contents">
            <button
              onClick={() => navigate('ai')}
              className={tab(state.currentPage === 'ai')}
            >
              <Sparkles size={20} strokeWidth={state.currentPage === 'ai' ? 2.5 : 1.8} />
              <span>{t('nav.ai')}</span>
            </button>

            <button
              onClick={() => navigate('settings')}
              className={tab(state.currentPage === 'settings')}
            >
              <Settings size={20} strokeWidth={state.currentPage === 'settings' ? 2.5 : 1.8} />
              <span>{t('nav.settings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
