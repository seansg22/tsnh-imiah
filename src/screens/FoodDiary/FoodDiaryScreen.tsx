import { useState } from 'react';
import { Plus, Trash2, Pencil, Sparkles, Sun, Moon, Milk, Utensils, TriangleAlert, Baby } from 'lucide-react';
import { parseISO, differenceInWeeks } from 'date-fns';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { FoodDiaryForm } from '../../components/food/FoodDiaryForm';
import { ALLERGIES, FOODS, PORTIONS } from '../../components/food/foodOptions';
import { solidsOf } from '../../lib/solids';
import { milkTotals, type MilkTotal } from '../../lib/milkTotal';
import type { LucideIcon } from 'lucide-react';
import type { FoodEntry, MilkFields } from '../../types';

interface Row { name: string; parts: unknown[]; snack?: boolean }
const hasMom = (m: MilkFields) => m.momTimes !== undefined || m.momMl !== undefined || !!m.momWays?.length;

export function FoodDiaryScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const [showAdvice, setShowAdvice] = useState(false);
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
      <div className="px-4 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">{t('fd.title')}</h1>
          <p className="text-textMuted text-sm font-medium mt-1">{t('fd.subtitle')}</p>
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
          // "name · detail · detail": the name is bold, the details are muted
          const milkRowsOf = (m: MilkFields): Row[] => [
            hasMom(m) && { name: t('fd.momMilk'), parts: [m.momTimes !== undefined && `${m.momTimes}×`, m.momMl !== undefined && `${m.momMl} ml`, m.momWays?.length && m.momWays.map(w => t(w === 'breast' ? 'fd.wayBreast' : 'fd.wayBottle')).join(' + ')] },
            (m.formulaTimes !== undefined || m.formulaMl !== undefined) && { name: t('fd.formula'), parts: [m.formulaTimes !== undefined && `${m.formulaTimes}×`, m.formulaMl !== undefined && `${m.formulaMl} ml`] },
          ].filter(Boolean) as Row[];
          const allergyLines = entry.allergy?.map(a => ((ALLERGIES as readonly string[]).includes(a) ? t(`fd.allergy.${a}` as UiKey) : a)) ?? [];
          const poopItems = entry.poop
            ? [
                entry.poop.times !== undefined && `${entry.poop.times}×`,
                entry.poop.colors?.length && entry.poop.colors.map(c => t(`fd.poopColor.${c}` as UiKey)).join(', '),
                entry.poop.textures?.length && entry.poop.textures.map(x => t(`fd.poopTexture.${x}` as UiKey)).join(', '),
              ].filter(Boolean) as string[]
            : [];
          const totals = milkTotals(entry);
          // "330 ml" with a plus when some feeds had no ml, so it is a minimum
          const plus = (m: MilkTotal) => (m.complete ? '' : '+');
          const totalRow = (name: string, m: MilkTotal): Row[] => (m.ml > 0 ? [{ name, parts: [`${m.ml}${plus(m)} ml`] }] : []);
          const blocks: { title: string; Icon: LucideIcon; rows: Row[] }[] = [
            { title: t('fd.milkDay'), Icon: Sun, rows: milkRowsOf(entry) },
            { title: t('fd.milkNight'), Icon: Moon, rows: entry.night ? milkRowsOf(entry.night) : [] },
            { title: t('fd.milkTotal'), Icon: Milk, rows: [...totalRow(t('fd.totalDay'), totals.day), ...totalRow(t('fd.totalNight'), totals.night), ...totalRow(t('fd.totalAll'), totals.all)] },
            { title: t('fd.solid'), Icon: Utensils, rows: solidsOf(entry).map(m => ({ name: m.foods.map(foodLabel).join(', '), parts: [m.portion && portionLabel(m.portion)], snack: m.snack })) },
            { title: t('fd.poop'), Icon: Baby, rows: poopItems.length ? [{ name: poopItems[0], parts: poopItems.slice(1) }] : [{ name: t('fd.noPoop'), parts: [] }] },
          ].filter(b => b.rows.length > 0);
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
              {blocks.length > 0 && (
                <div className="mt-2 pr-3 space-y-2.5">
                  {blocks.map(({ title, Icon, rows }) => (
                    <div key={title} className="flex gap-2">
                      <Icon size={14} strokeWidth={2.5} className="text-peachDark mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-peachDark">{title}</p>
                        {rows.map((row, i) => {
                          const parts = row.parts.filter(Boolean);
                          return (
                            <p key={i} className="text-sm leading-snug">
                              <span className="font-semibold text-app-text">{row.name}</span>
                              {parts.length > 0 && <span className="text-textMuted"> · {parts.join(' · ')}</span>}
                              {row.snack && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-peachLight text-peachDark text-[10px] font-bold align-middle">{t('fd.snack')}</span>}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {allergyLines.length > 0 && (
                <div className="mt-2 pr-3 flex gap-2 items-start text-red-500">
                  <TriangleAlert size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold leading-snug">{t('fd.allergy')}: {allergyLines.join(', ')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pb-6" />
      {showAdvice && <AdviceModal kind="fooddiary" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
