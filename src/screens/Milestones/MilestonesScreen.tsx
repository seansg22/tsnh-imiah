import { useRef, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { getMilestones } from '../../data/localized';
import { useLang } from '../../i18n/langContext';
import { useApp } from '../../context/appStateContext';
import { useBabyAge } from '../../hooks/useBabyAge';
import { MilestoneItem } from '../../components/milestones/MilestoneItem';
import type { Milestone } from '../../types';

const groups = [
  { label: 'ms.g1' as const,    range: [0,   4]   as [number, number] },
  { label: 'ms.g2' as const,   range: [4,   12]  as [number, number] },
  { label: 'ms.g3' as const,  range: [12,  24]  as [number, number] },
  { label: 'ms.g4' as const,  range: [24,  36]  as [number, number] },
  { label: 'ms.g5' as const,  range: [36,  52]  as [number, number] },
  { label: 'ms.g6' as const,  range: [52,  78]  as [number, number] },
  { label: 'ms.g7' as const,  range: [78,  104] as [number, number] },
  { label: 'ms.g8' as const,    range: [104, 200] as [number, number] },
];

type CategoryFilter = 'all' | Milestone['category'];

export function MilestonesScreen() {
  const { t, lang } = useLang();
  const milestones = getMilestones(lang);
  const { state, dispatch } = useApp();
  const { currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  function handleFilterChange(cat: CategoryFilter) {
    setFilter(cat);
    if (contentRef.current) {
      const top = contentRef.current.getBoundingClientRect().top + window.scrollY;
      const offset = stickyRef.current?.offsetHeight ?? 0;
      window.scrollTo({ top: top - offset, behavior: 'smooth' });
    }
  }

  const categories: CategoryFilter[] = ['all', 'motor', 'cognitive', 'social', 'sensory', 'vaccination'];
  const query = search.trim().toLowerCase();
  const filtered = milestones
    .filter(m => filter === 'all' || m.category === filter)
    .filter(m => !query || m.label.toLowerCase().includes(query) || m.description?.toLowerCase().includes(query))
    .sort((a, b) => a.weekRange[0] - b.weekRange[0] || a.weekRange[1] - b.weekRange[1]);
  const achieved = new Set(state.achievedMilestones);
  const achievedCount = milestones.filter(m => achieved.has(m.id)).length;

  return (
    <div className="fade-in">
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-app-text">{t('ms.title')}</h1>
            <p className="text-textMuted text-sm font-medium mt-1">
              {t('ms.achieved', { done: achievedCount, total: milestones.length })}
            </p>
          </div>
          <button
            onClick={() => setShowAdvice(true)}
            aria-label={t('ai.advice.open')}
            className="flex-shrink-0 flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-xs font-extrabold shadow-md shadow-fuchsia-300/50 active:scale-95 transition-transform"
          >
            <Sparkles size={16} strokeWidth={2.5} />
            {t('ai.title')}
          </button>
        </div>
        <div className="w-full bg-peachLight rounded-full h-2 mt-2">
          <div
            className="bg-peach h-2 rounded-full transition-all"
            style={{ width: `${(achievedCount / milestones.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Search + Category filter — sticky */}
      <div ref={stickyRef} className="sticky top-0 z-10 bg-cream px-4 pb-3 pt-3">
        <div className="flex items-center gap-2 bg-warm rounded-xl px-3 py-2">
          <Search size={16} className="text-textMuted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('ms.search')}
            className="flex-1 bg-transparent text-sm text-app-text placeholder:text-textMuted outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-textMuted text-xs font-bold">✕</button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                filter === cat ? 'bg-peach text-white' : 'bg-warm text-textMuted'
              }`}
            >
              {t(`cat.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone groups */}
      <div ref={contentRef} className="px-4 space-y-6 pb-6">
        {filtered.length === 0 && (
          <p className="text-center text-textMuted text-sm py-8">{t('ms.none')}</p>
        )}
        {groups.map(group => {
          const groupMilestones = filtered.filter(
            m => m.weekRange[0] >= group.range[0] && m.weekRange[0] < group.range[1]
          );
          if (groupMilestones.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">{t(group.label)}</p>
              <div className="space-y-2">
                {groupMilestones.map(m => (
                  <MilestoneItem
                    key={m.id}
                    milestone={m}
                    achieved={achieved.has(m.id)}
                    overdue={m.weekRange[1] <= currentWeek && !achieved.has(m.id)}
                    onToggle={() => dispatch({ type: 'TOGGLE_MILESTONE', payload: m.id })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showAdvice && <AdviceModal kind="milestones" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
