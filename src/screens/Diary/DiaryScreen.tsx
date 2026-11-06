import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { SegmentedTabs } from '../../components/shared/SegmentedTabs';
import { FoodDiaryScreen } from '../FoodDiary/FoodDiaryScreen';
import { SleepScreen } from '../Sleep/SleepScreen';

type Tab = 'fooddiary' | 'sleep';

// Food diary and sleep diary in one page. The current page value is the selected tab,
// so banners that open 'fooddiary' still land on the right one.
export function DiaryScreen() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [showAdvice, setShowAdvice] = useState(false);
  const tab: Tab = state.currentPage === 'sleep' ? 'sleep' : 'fooddiary';
  const empty = state.foodEntries.length === 0 && state.sleepEntries.length === 0;

  return (
    <div className="fade-in">
      <div className="px-4 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">{t('diary.title')}</h1>
          <p className="text-textMuted text-sm font-medium mt-1">{t('diary.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAdvice(true)}
          disabled={empty}
          aria-label={t('ai.advice.open')}
          className="flex-shrink-0 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-xs font-extrabold shadow-md shadow-fuchsia-300/50 active:scale-95 transition-transform"
        >
          <Sparkles size={16} strokeWidth={2.5} />
          {t('ai.title')}
        </button>
      </div>

      <SegmentedTabs
        className="mx-4 mb-4"
        options={[{ key: 'fooddiary', label: t('diary.food') }, { key: 'sleep', label: t('diary.sleep') }]}
        value={tab}
        onChange={key => dispatch({ type: 'SET_PAGE', payload: key })}
      />

      {tab === 'sleep' ? <SleepScreen /> : <FoodDiaryScreen />}
      {showAdvice && <AdviceModal kind="diary" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
