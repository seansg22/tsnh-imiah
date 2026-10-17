import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { parseISO, differenceInWeeks } from 'date-fns';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { FoodDiaryForm } from '../../components/food/FoodDiaryForm';
import { ALLERGIES, FOODS, PORTIONS } from '../../components/food/foodOptions';
import type { FoodEntry } from '../../types';

export function FoodDiaryScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  const birthDate = state.babyProfile?.birthDate ?? '';
  const entries = state.foodEntries;

  function handleSave(entry: FoodEntry) {
    dispatch({ type: 'UPSERT_FOOD_ENTRY', payload: entry });
    setShowForm(false);
    setEditingEntry(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEntry(null);
  }

  // chip keys get translated, free text is shown as typed
  const foodLabel = (f: string) => ((FOODS as readonly string[]).includes(f) ? t(`fd.food.${f}` as UiKey) : f);
  const portionLabel = (p: string) => ((PORTIONS as readonly string[]).includes(p) ? t(`fd.portion.${p}` as UiKey) : p);

  return (
    <div className="fade-in">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-app-text">{t('fd.title')}</h1>
        <p className="text-textMuted text-sm font-medium mt-1">{t('fd.subtitle')}</p>
      </div>

      <div className="px-4 mb-4">
        {editingEntry ? (
          <FoodDiaryForm key={editingEntry.id} initialEntry={editingEntry} onSave={handleSave} onCancel={handleCancel} />
        ) : showForm ? (
          <FoodDiaryForm prefill={entries[entries.length - 1]} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peachLight text-peachDark text-xs font-bold hover:bg-peachLight/30 transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('fd.add')}
          </button>
        )}
      </div>

      <div className="px-4 space-y-2">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1">{t('fd.history')}</p>
        {entries.length === 0 && <p className="text-xs text-textMuted">{t('fd.empty')}</p>}
        {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
          const ageWeeks = birthDate ? differenceInWeeks(parseISO(entry.date), parseISO(birthDate)) : null;
          const times = (n?: number) => (n !== undefined ? t('fd.timesVal', { n }) : undefined);
          // one fact per line
          const milkLines = [
            entry.momTimes !== undefined && `${t('fd.momMilk')}: ${times(entry.momTimes)}`,
            (entry.formulaTimes !== undefined || entry.formulaMl !== undefined) && `${t('fd.formula')}${entry.formulaTimes !== undefined ? `: ${times(entry.formulaTimes)}` : ''}`,
            entry.formulaMl !== undefined && t('fd.mlEach', { n: entry.formulaMl }),
          ].filter(Boolean);
          const allergyLines = entry.allergy?.map(a => ((ALLERGIES as readonly string[]).includes(a) ? t(`fd.allergy.${a}` as UiKey) : a)) ?? [];
          const solidLines = entry.foods
            ? [
                entry.foods.map(foodLabel).join(', '),
                times(entry.solidTimes),
                entry.portion && `${portionLabel(entry.portion)} ${t('fd.each')}`,
              ].filter(Boolean)
            : [];
          const section = (title: string, lines: unknown[]) => (
            <div className="min-w-0">
              <p className="text-xs font-bold text-peachDark">{title}</p>
              {lines.map((l, i) => <p key={i} className="text-xs text-app-text font-semibold">{String(l)}</p>)}
            </div>
          );
          return (
            <div
              key={entry.id}
              className={`bg-white rounded-xl pl-4 pr-1 py-2.5 shadow-sm transition-opacity ${editingEntry?.id === entry.id ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <p className="flex-1 min-w-0 text-sm font-bold text-app-text">
                  {formatDate(parseISO(entry.date), 'dd MMM yyyy', lang)}
                  {ageWeeks !== null && ageWeeks >= 0 && (
                    <span className="ml-2 text-xs font-medium text-textMuted">{t('growth.weekN', { n: ageWeeks })}</span>
                  )}
                </p>
                <button
                  onClick={() => { setShowForm(false); setEditingEntry(entry); }}
                  className="p-1.5 text-textMuted hover:text-peach transition-colors flex-shrink-0"
                >
                  <Pencil size={15} strokeWidth={2} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_FOOD_ENTRY', payload: entry.id })}
                  className="p-1.5 text-textMuted hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
              {(milkLines.length > 0 || solidLines.length > 0) && (
                <div className="grid grid-cols-2 gap-3 mt-1 pr-3">
                  {milkLines.length > 0 && section(t('fd.milk'), milkLines)}
                  {solidLines.length > 0 && section(t('fd.solid'), solidLines)}
                </div>
              )}
              {allergyLines.length > 0 && (
                <p className="mt-1 pr-3 text-xs font-semibold text-red-500">
                  {t('fd.allergy')}: {allergyLines.join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pb-6" />
    </div>
  );
}
