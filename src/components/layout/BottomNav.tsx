import { Home, Star, Sparkles, TrendingUp, Settings, BookOpenText, Baby, CalendarDays, Compass, UserRound, Utensils } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/appStateContext';
import { milestones } from '../../data/weeklyDevelopment';
import { useBabyAge } from '../../hooks/useBabyAge';
import type { Page } from '../../types';

const homeOptions: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: 'today',    icon: Home,         label: 'Today'    },
  { page: 'insights', icon: Sparkles,     label: 'Insights' },
  { page: 'food',     icon: Utensils,     label: 'Food'     },
  { page: 'wonderweek', icon: CalendarDays, label: 'Wonder Week' },
];


const progressOptions: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: 'babyprofile', icon: UserRound,  label: 'Baby Profile' },
  { page: 'milestones',  icon: Star,       label: 'Milestones'   },
  { page: 'growth',      icon: TrendingUp, label: 'Growth'       },
];

export function BottomNav() {
  const { state, dispatch } = useApp();
  const [showProgress, setShowProgress] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const homeMenuRef = useRef<HTMLDivElement>(null);

  const isProgressActive = state.currentPage === 'milestones' || state.currentPage === 'growth' || state.currentPage === 'babyprofile';
  const isHomeActive = state.currentPage === 'today' || state.currentPage === 'insights' || state.currentPage === 'food' || state.currentPage === 'wonderweek';
  const { currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const unfinishedMilestones = milestones.filter(
    m => m.weekRange[1] <= currentWeek && !state.achievedMilestones.includes(m.id)
  ).length;

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
      @keyframes ai-spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to   { transform: translate(-50%, -50%) rotate(360deg); }
      }
      .ai-spin-gradient {
        position: absolute;
        top: 50%; left: 50%;
        width: 220%; height: 220%;
        background: conic-gradient(from 0deg, #6366f1, #8b5cf6, #a78bfa, #7dd3fc, #818cf8, #6366f1);
        animation: ai-spin 15s linear infinite;
      }
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
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative bg-white">
        {/* Nav bar */}
        <div className="relative bg-white border-t border-peachLight flex items-center h-16">
          {/* Left: Home + Progress */}
          <div className="flex flex-1 justify-start gap-3 pl-3 relative z-20">
            <div ref={homeMenuRef} className="relative flex flex-col items-center">
              {showHome && (
                <div className="popup-appear absolute bottom-full mb-2 left-0 flex flex-col items-center gap-1 bg-white border border-peachLight rounded-2xl shadow-lg py-2 px-1 min-w-[140px]">
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
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setShowHome(v => !v)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-semibold transition-colors ${
                  isHomeActive ? 'text-peachDark' : 'text-textMuted'
                }`}
              >
                <Compass size={22} strokeWidth={isHomeActive ? 2.5 : 1.8} />
                <span>Explore</span>
              </button>
            </div>

            <div ref={menuRef} className="relative flex flex-col items-center">
              {showProgress && (
                <div className="popup-appear absolute bottom-full mb-2 -right-6 flex flex-col items-center gap-1 bg-white border border-peachLight rounded-2xl shadow-lg py-2 px-1 min-w-[140px]">
                  {progressOptions.map(({ page, icon: Icon, label }) => {
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
                        <span>{label}</span>
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
                className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-semibold transition-colors ${
                  isProgressActive ? 'text-peachDark' : 'text-textMuted'
                }`}
              >
                <div className="relative">
                  <Baby size={22} strokeWidth={isProgressActive ? 2.5 : 1.8} />
                  {unfinishedMilestones > 0 && (
                    <span className="absolute -top-2 -right-4 min-w-[18px] h-[18px] px-1 bg-peachDark text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                      {unfinishedMilestones > 99 ? '99+' : unfinishedMilestones}
                    </span>
                  )}
                </div>
                <span>Baby</span>
              </button>
            </div>
          </div>

          {/* Center spacer for the button */}
          <div className="w-16 flex-shrink-0" />

          {/* Right tabs: Read + Settings */}
          <div className="flex flex-1 justify-end gap-3 pr-3 relative z-20">
            <button
              onClick={() => navigate('book')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-semibold transition-colors ${
                state.currentPage === 'book' ? 'text-peachDark' : 'text-textMuted'
              }`}
            >
              <BookOpenText size={22} strokeWidth={state.currentPage === 'book' ? 2.5 : 1.8} />
              <span>Read</span>
            </button>

            <button
              onClick={() => navigate('settings')}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-semibold transition-colors ${
                state.currentPage === 'settings' ? 'text-peachDark' : 'text-textMuted'
              }`}
            >
              <Settings size={22} strokeWidth={state.currentPage === 'settings' ? 2.5 : 1.8} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Center AI circle button — floats above the notch */}
        <button
          onClick={() => navigate('ai')}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[35%] w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-30 overflow-hidden"
        >
          <div className="ai-spin-gradient" />
          <Sparkles size={28} strokeWidth={2.2} className="text-white relative z-10" />
        </button>
      </div>
    </div>
    </>
  );
}
