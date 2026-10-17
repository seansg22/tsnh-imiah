import { useState } from 'react';
import { Plus, Trash2, Pencil, Sparkles } from 'lucide-react';
import { parseISO, differenceInWeeks, differenceInDays } from 'date-fns';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { GrowthChart } from '../../components/growth/GrowthChart';
import { GrowthEntryForm } from '../../components/growth/GrowthEntryForm';
import { type GrowthMetric, metricConfig, zScoreOf, percentileOfZ, MAX_WEEK } from '../../data/whoGrowthData';
import type { GrowthEntry } from '../../types';

const metrics: GrowthMetric[] = ['weight', 'length', 'head'];

export function GrowthScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>('weight');
  const [showAdvice, setShowAdvice] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GrowthEntry | null>(null);

  const birthDate = state.babyProfile?.birthDate ?? '';
  const gender = state.babyProfile?.gender ?? 'girl';
  const entries = state.growthEntries;

  function handleSave(entry: GrowthEntry) {
    if (editingEntry) {
      dispatch({ type: 'UPDATE_GROWTH_ENTRY', payload: entry });
      setEditingEntry(null);
    } else {
      dispatch({ type: 'ADD_GROWTH_ENTRY', payload: entry });
      setShowForm(false);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEntry(null);
  }

  function handleEdit(entry: GrowthEntry) {
    setShowForm(false);
    setEditingEntry(entry);
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
    return { p: percentileOfZ(z) };
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
          aria-label={t('ai.advice.open')}
          className="flex-shrink-0 flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-xs font-extrabold shadow-md shadow-fuchsia-300/50 active:scale-95 transition-transform"
        >
          <Sparkles size={16} strokeWidth={2.5} />
          {t('ai.title')}
        </button>
      </div>

      {/* Metric tabs */}
      <div className="flex gap-2 px-4 pb-4">
        {metrics.map(m => (
          <button
            key={m}
            onClick={() => setActiveMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeMetric === m ? 'bg-peach text-white' : 'bg-warm text-textMuted'
            }`}
          >
            {t(`growth.metric.${m}`)}
          </button>
        ))}
      </div>

      {/* Chart */}
      {birthDate ? (
        <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm mb-4">
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
        {editingEntry ? (
          <GrowthEntryForm
            key={editingEntry.id}
            initialEntry={editingEntry}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : showForm ? (
          <GrowthEntryForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peachLight text-peachDark text-xs font-bold hover:bg-peachLight/30 transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('growth.add')}
          </button>
        )}
      </div>

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1">{t('growth.history')}</p>
          {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
            const ageWeeks = birthDate
              ? differenceInWeeks(parseISO(entry.date), parseISO(birthDate))
              : null;
            const isEditing = editingEntry?.id === entry.id;
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm transition-opacity ${isEditing ? 'opacity-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-app-text">
                    {formatDate(parseISO(entry.date), 'dd MMM yyyy', lang)}
                  </p>
                  {ageWeeks !== null && ageWeeks >= 0 && (
                    <p className="text-xs text-textMuted">{t('growth.weekN', { n: ageWeeks })}</p>
                  )}
                  <div className="flex gap-4 mt-1 flex-wrap">
                    {metrics.map(m => {
                      const val = entry[m];
                      if (val === undefined) return null;
                      const st = statOf(entry, m);
                      return (
                        <div key={m}>
                          <span className="text-xs text-app-text font-semibold">
                            {m === 'weight' ? `${val} kg` : m === 'length' ? `${val} cm` : t('growth.headVal', { n: val })}
                          </span>
                          {st && (
                            <p className={`text-xs ${st.p > 97 ? 'text-red-500 font-bold' : st.p < 3 ? 'text-purple-500 font-bold' : 'text-green-600'}`}>
                              P{Math.round(st.p)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(entry)}
                  className="p-2 text-textMuted hover:text-peach transition-colors flex-shrink-0"
                >
                  <Pencil size={15} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-textMuted hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="pb-6" />
      {showAdvice && <AdviceModal kind="growth" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
