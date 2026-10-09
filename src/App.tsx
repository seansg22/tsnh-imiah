import { lazy, Suspense, useEffect } from 'react';
import { AppProvider } from './context/AppContext.tsx';
import { useApp } from './context/appStateContext';
import { AppShell } from './components/layout/AppShell';
import { OnboardingScreen } from './screens/Onboarding/OnboardingScreen';
import { TodayScreen } from './screens/Today/TodayScreen';
import { MilestonesScreen } from './screens/Milestones/MilestonesScreen';
import { InsightsScreen } from './screens/Insights/InsightsScreen';
import { SettingsScreen } from './screens/Settings/SettingsScreen';
import { BabyProfileScreen } from './screens/BabyProfile/BabyProfileScreen';
import { GrowthScreen } from './screens/Growth/GrowthScreen';
import { AIScreen } from './screens/AI/AIScreen';
import { FoodScreen } from './screens/Food/FoodScreen';
import { OverdueBanner } from './components/banners/OverdueBanner';
import { ProfileUpdateBanner } from './components/banners/ProfileUpdateBanner';
import { WonderWeekCalendar } from './components/milestones/WonderWeekCalendar';
import { milestones } from './data/weeklyDevelopment';
import { useBabyAge } from './hooks/useBabyAge';
import { useCloudSync } from './hooks/useCloudSync';
import { DEFAULT_EDD } from './constants/babyDefaults';

const BookScreen = lazy(() =>
  import('./screens/Book/BookScreen').then((module) => ({ default: module.BookScreen })),
);

function AppContent() {
  const { state, dispatch } = useApp();
  useCloudSync();
  const { currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const achieved = new Set(state.achievedMilestones);
  const overdueCount = milestones.filter(m => m.weekRange[1] <= currentWeek && !achieved.has(m.id)).length;

  useEffect(() => {
    if (!state.babyProfile && state.currentPage !== 'onboarding') {
      dispatch({ type: 'SET_PAGE', payload: 'onboarding' });
    }
  }, [dispatch, state.babyProfile, state.currentPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentPage]);

  if (!state.babyProfile || state.currentPage === 'onboarding') {
    return <OnboardingScreen />;
  }

  if (state.currentPage === 'ai') {
    return <AIScreen />;
  }

  if (state.currentPage === 'book') {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cream text-sm font-extrabold text-textMuted">
            Loading book...
          </div>
        }
      >
        <BookScreen />
      </Suspense>
    );
  }

  const pages: Record<string, React.ReactNode> = {
    today: <TodayScreen />,
    milestones: <MilestonesScreen />,
    insights: <InsightsScreen />,
    food: <FoodScreen />,
    growth: <GrowthScreen />,
    settings: <SettingsScreen />,
    babyprofile: <BabyProfileScreen />,
    wonderweek: state.babyProfile ? (
      <WonderWeekCalendar eddDate={state.babyProfile.edd ?? DEFAULT_EDD} />
    ) : null,
  };

  return (
    <AppShell>
      <div className="absolute top-4 left-4 right-4 z-40 flex flex-col gap-2">
        {state.currentPage !== 'milestones' && (
          <OverdueBanner
            count={overdueCount}
            babyName={state.babyProfile?.name ?? ''}
            onNavigate={() => dispatch({ type: 'SET_PAGE', payload: 'milestones' })}
          />
        )}
        {state.currentPage !== 'babyprofile' && (
          <ProfileUpdateBanner
            birthDate={state.babyProfile.birthDate}
            babyName={state.babyProfile?.name ?? ''}
            onNavigate={() => dispatch({ type: 'SET_PAGE', payload: 'babyprofile' })}
          />
        )}
      </div>
      {pages[state.currentPage] ?? <TodayScreen />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
