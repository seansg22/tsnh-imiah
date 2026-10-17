import { useEffect } from 'react';
import { Baby, Lightbulb } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import { useApp } from '../../context/appStateContext';
import { useBabyAge } from '../../hooks/useBabyAge';
import { getWeekData } from '../../data/localized';
import { getLocalizedCareTips, getLocalizedSoothingLabel } from '../../data/localizedCare';
import { WeekStrip } from '../../components/today/WeekStrip';
import { AgeDisplay } from '../../components/today/AgeDisplay';
import { WhatToExpectSection } from '../../components/today/WhatToExpectSection';
import { CareTipsSection } from '../../components/today/CareTipsSection';

export function TodayScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const { weeks, days, years, remainingWeeks, currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const selectedWeek = state.selectedWeek;
  const weekData = getWeekData(lang, selectedWeek);
  const careTips = getLocalizedCareTips(selectedWeek, lang);
  const soothingLabel = getLocalizedSoothingLabel(selectedWeek, lang);

  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek });
  }, [currentWeek, dispatch]);

  return (
    <>
      <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">{state.babyProfile?.name}</h1>
        </div>
        <div className="flex items-center justify-end w-24">
          {selectedWeek !== currentWeek ? (
            <button
              onClick={() => dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek })}
              className="flex items-center gap-1.5 bg-peach text-white text-xs font-bold px-3 h-10 rounded-full shadow-sm active:scale-95 transition-all"
            >
              {t('today.backToToday')}
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-peachLight flex items-center justify-center text-peachDark">
              <Baby size={22} strokeWidth={1.8} />
            </div>
          )}
        </div>
      </div>

      {/* Week strip */}
      <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur-[2px] pb-1">
        <WeekStrip
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onSelectWeek={week => dispatch({ type: 'SET_SELECTED_WEEK', payload: week })}
        />
      </div>

      {/* Age display */}
      <div className="pt-6">
        <AgeDisplay name={state.babyProfile?.name ?? ''} weeks={weeks} days={days} years={years} remainingWeeks={remainingWeeks} selectedWeek={selectedWeek} currentWeek={currentWeek} />
      </div>


      {/* What to expect */}
      <WhatToExpectSection week={selectedWeek} data={weekData} />

      {/* Did you know */}
      {weekData.funFact && (
        <div className="px-4 pt-2 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} strokeWidth={2} className="text-amber-500" />
            <p className="text-base font-extrabold text-app-text">{t('today.didYouKnow')}</p>
          </div>
          <p className="text-sm text-textMuted leading-relaxed">{weekData.funFact}</p>
        </div>
      )}

      {/* Care guide */}
      <CareTipsSection tips={careTips} soothingLabel={soothingLabel} parentTip={weekData.parentTip} />

      </div>

    </>
  );
}
