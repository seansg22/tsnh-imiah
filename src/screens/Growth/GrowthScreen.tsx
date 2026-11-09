import { useState } from 'react';
import { Plus, Trash2, Pencil, Sparkles, Scale, Ruler, Baby, TriangleAlert, type LucideIcon } from 'lucide-react';
import { parseISO, differenceInWeeks, differenceInDays } from 'date-fns';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { GrowthChart } from '../../components/growth/GrowthChart';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { GrowthEntryForm } from '../../components/growth/GrowthEntryForm';
import { type GrowthMetric, metricConfig, zScoreOf, percentileOfZ, MAX_WEEK } from '../../data/whoGrowthData';
import type { GrowthEntry } from '../../types';
import { cardShadow } from '../../components/shared/cardStyle';
import { SegmentedTabs } from '../../components/shared/SegmentedTabs';

const metrics: GrowthMetric[] = ['weight', 'length', 'head'];
const metricIcon: Record<GrowthMetric, LucideIcon> = { weight: Scale, length: Ruler, head: Baby };

export function GrowthScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>('weight');
  const [showAdvice, setShowAdvice] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIds, setEditingIds] = useState<string[]>([]); // many edit forms can be open, and the add form too
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const birthDate = state.babyProfile?.birthDate ?? '';
  const gender = state.babyProfile?.gender ?? 'girl';
  const entries = state.growthEntries;

  function handleAdd(entry: GrowthEntry) {
    dispatch({ type: 'ADD_GROWTH_ENTRY', payload: entry });
    setShowForm(false);
  }

  const closeEdit = (id: string) => setEditingIds(prev => prev.filter(x => x !== id));

  function handleUpdate(entry: GrowthEntry) {
    dispatch({ type: 'UPDATE_GROWTH_ENTRY', payload: entry });
    closeEdit(entry.id);
  }

  function handleEdit(entry: GrowthEntry) {
    setEditingIds(prev => (prev.includes(entry.id) ? prev : [...prev, entry.id]));
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_GROWTH_ENTRY', payload: id });
  }

  const cfg = metricConfig[activeMetric];

  function statOf(entry: GrowthEntry, m: GrowthMetric) {
    const val = entry[m];
    const week = differenceInDays(parseISO(entry.date), parseISO(birthDate)) / 7;
    if (val === undefined || !birthDate || week < 0 || week > MAX_WEEK) return null;
    const z = zScoreOf(m, week, gender, val);
    return { p: percentileOfZ(z), z };
  }

  const entriesForMetric = entries.filter(e => e[activeMetric] !== undefined);

  return (
    <div className="fade-in">
      <div className="px-4 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">{t('growth.title')}</h1>
          <p className="text-textMuted text-sm font-medium mt-1">
            {t('growth.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAdvice(true)}
          disabled={entries.length === 0}
          aria-label={t('ai.advice.open')}
          className="flex-shrink-0 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-xs font-extrabold shadow-md shadow-fuchsia-300/50 active:scale-95 transition-transform"
        >
          <Sparkles size={16} strokeWidth={2.5} />
          {t('ai.title')}
        </button>
      </div>

      {/* Metric tabs */}
      <SegmentedTabs
        className="mx-4 mb-4"
        options={metrics.map(m => ({ key: m, label: t(`growth.metric.${m}`) }))}
        value={activeMetric}
        onChange={setActiveMetric}
      />

      {/* Chart */}
      {birthDate ? (
        <div className={`mx-4 bg-white rounded-2xl p-4 mb-4 ${cardShadow}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-app-text">
              {t(`growth.metric.${activeMetric}`)} ({cfg.unit})
            </p>
            <span className="text-xs text-textMuted">{t('growth.who')} · {t(gender === 'boy' ? 'bp.boy' : 'bp.girl')}</span>
          </div>
          <GrowthChart key={activeMetric} entries={entries} metric={activeMetric} birthDate={birthDate} gender={gender} />
          {entriesForMetric.length === 0 && (
            <p className="text-xs text-textMuted text-center mt-3">
              {t('growth.noData', { metric: t(`growth.metricLower.${activeMetric}`) })}
            </p>
          )}
        </div>
      ) : null}

      {/* Add / Edit form */}
      <div className="px-4 mb-4">
        {showForm ? (
          <GrowthEntryForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peach/60 bg-white/60 text-peachDark text-xs font-bold hover:bg-white transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('growth.add')}
          </button>
        )}
      </div>

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="px-4 space-y-4">
          <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1">{t('growth.history')}</p>
          {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
            const ageWeeks = birthDate
              ? differenceInWeeks(parseISO(entry.date), parseISO(birthDate))
              : null;
            // editing: the form takes the place of the card
            if (editingIds.includes(entry.id)) {
              return <GrowthEntryForm key={entry.id} initialEntry={entry} onSave={handleUpdate} onCancel={() => closeEdit(entry.id)} />;
            }
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl pl-4 pr-1 py-3 ${cardShadow}`}
              >
                <div className="flex items-center gap-2">
                  <p className="flex-1 min-w-0 text-sm font-bold text-app-text">
                    {formatDate(parseISO(entry.date), 'dd MMM yyyy', lang)}
                    {ageWeeks !== null && ageWeeks >= 0 && (
                      <span className="ml-2 text-xs font-medium text-textMuted">{t('growth.weekN', { n: ageWeeks })}</span>
                    )}
                  </p>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 text-textMuted hover:text-peach transition-colors flex-shrink-0"
                  >
                    <Pencil size={15} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setDeleteId(entry.id)}
                    className="p-1.5 text-textMuted hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
                {/* one tile per measure: value, with Z and P on the right */}
                <div className="mt-2 mr-3 flex gap-2">
                  {metrics.map(m => {
                    const val = entry[m];
                    const st = val === undefined ? null : statOf(entry, m);
                    // by Z: within ±2 normal, ±2 to ±3 watch, past ±3 see a doctor
                    const az = st ? Math.abs(st.z) : 0;
                    const alertTone = az > 3 ? 'text-red-600' : 'text-amber-800';
                    const card = az > 3 ? 'bg-red-100 ring-1 ring-red-300' : az > 2 ? 'bg-amber-100 ring-1 ring-amber-300' : 'bg-peachLight/50';
                    const Icon = metricIcon[m];
                    return (
                      <div key={m} className={`min-w-0 flex-1 rounded-2xl px-2.5 py-2 ${card}`}>
                        <p className="flex items-center gap-1 text-peachDark">
                          <Icon size={13} strokeWidth={2.5} className="shrink-0" />
                          <span className="truncate text-[11px] font-semibold leading-none text-textMuted">{t(`growth.metric.${m}`)}</span>
                          {az > 2 && <TriangleAlert size={13} strokeWidth={2.5} className={`ml-auto shrink-0 ${alertTone}`} />}
                        </p>
                        <div className="mt-1.5">
                          {val === undefined ? (
                            <p className="text-lg font-extrabold leading-none text-textMuted">-</p>
                          ) : (
                            <p className="whitespace-nowrap text-lg font-extrabold leading-none text-app-text">
                              {val}<span className="ml-0.5 text-[11px] font-bold text-textMuted">{m === 'weight' ? 'kg' : 'cm'}</span>
                            </p>
                          )}
                        </div>
                        {st && (
                          <div className={`mt-2 flex items-center justify-between border-t border-white pt-1.5 text-[11px] font-bold leading-none text-textMuted`}>
                            <span>Z{st.z > 0 ? '+' : ''}{st.z.toFixed(1)}</span>
                            <span>P{Math.round(st.p)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pb-6" />
      {deleteId && (
        <ConfirmDialog
          onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
      {showAdvice && <AdviceModal kind="growth" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
