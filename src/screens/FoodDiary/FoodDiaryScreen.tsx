import { Fragment, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, Sun, Moon, Milk, Utensils, TriangleAlert, Baby, ChevronDown, Check } from 'lucide-react';
import { parseISO, differenceInWeeks } from 'date-fns';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { DateInput } from '../../components/shared/DateInput';
import { FoodDiaryForm } from '../../components/food/FoodDiaryForm';
import { ALLERGIES, FOODS, PORTIONS } from '../../components/food/foodOptions';
import { solidsOf } from '../../lib/solids';
import { milkTotals, type MilkTotal } from '../../lib/milkTotal';
import { dayMilksOf } from '../../lib/dayMilks';
import { foldTimes } from '../../lib/foodForm';
import type { LucideIcon } from 'lucide-react';
import type { FoodEntry, MilkFields } from '../../types';
import { cardShadow } from '../../components/shared/cardStyle';

interface Row { name: string; parts: unknown[]; badges?: string[] }
interface Feed { n: number; title: string; rows: Row[] } // one daytime milk record
const hasMom = (m: MilkFields) => m.momTimes !== undefined || m.momMl !== undefined || !!m.momWays?.length;

export function FoodDiaryScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<string[]>([]); // cards showing the detail, the rest show the summary
  const toggle = (id: string) => setOpenIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));

  const birthDate = state.babyProfile?.birthDate ?? '';
  // the start date of solids lives on the baby profile
  const setSolidsStart = (solidsStartDate: string) => {
    if (state.babyProfile) dispatch({ type: 'SET_BABY_PROFILE', payload: { ...state.babyProfile, solidsStartDate } });
  };
  const entries = state.foodEntries;

  // the popup opens over the page: remember where we were and go back there when it closes
  const savedY = useRef<number | null>(null);
  const remember = () => { savedY.current = window.scrollY; };
  useEffect(() => {
    if (showForm || editingEntry || savedY.current === null) return;
    window.scrollTo({ top: savedY.current, behavior: 'instant' });
    savedY.current = null;
  }, [showForm, editingEntry]);

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
      <div className="px-4 mb-4">
        {editingEntry ? (
          <FoodDiaryForm key={editingEntry.id} initialEntry={editingEntry} onSave={handleSave} onCancel={handleCancel} />
        ) : showForm ? (
          <FoodDiaryForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <button
            onClick={() => { remember(); setShowForm(true); }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peach/60 bg-white/60 text-peachDark text-xs font-bold hover:bg-white transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('fd.add')}
          </button>
        )}
      </div>

      <div className="px-4 space-y-4">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1">{t('fd.history')}</p>
        {entries.length === 0 && <p className="text-xs text-textMuted">{t('fd.empty')}</p>}
        {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
          const ageWeeks = birthDate ? differenceInWeeks(parseISO(entry.date), parseISO(birthDate)) : null;
          // "name · detail · detail": the name is bold, the details are muted
          const milkRowsOf = (raw: MilkFields): Row[] => {
            const m = foldTimes(raw);
            return [
            hasMom(m) && { name: t('fd.momMilk'), parts: [m.momTimes !== undefined && `${m.momTimes}×`, m.momMl !== undefined && `${m.momMl} ml`], badges: (m.momWays ?? []).map(w => t(w === 'breast' ? 'fd.wayBreast' : 'fd.wayBottle')) },
            (m.formulaTimes !== undefined || m.formulaMl !== undefined) && { name: t('fd.formula'), parts: [m.formulaTimes !== undefined && `${m.formulaTimes}×`, m.formulaMl !== undefined && `${m.formulaMl} ml`] },
            ].filter(Boolean) as Row[];
          };
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
          // several daytime records: shown as numbered feeds
          const dayRecords = dayMilksOf(entry);
          const feeds: Feed[] | undefined = dayRecords.length > 1
            ? dayRecords.map((m, i) => ({ n: i + 1, title: t('fd.feedN', { n: i + 1 }), rows: milkRowsOf(m) }))
            : undefined;
          // several solids: the same numbered cards; a snack is titled Snack, main meals are Meal 1, 2, 3 (never the block title again)
          const solids = solidsOf(entry);
          const solidFeeds: Feed[] | undefined = solids.length > 1
            ? solids.map((m, i) => ({
                n: i + 1,
                title: m.snack ? t('fd.snack') : t('fd.solidN', { n: solids.slice(0, i).filter(x => !x.snack).length + 1 }),
                rows: [{ name: m.foods.map(foodLabel).join(', '), parts: [m.portion && portionLabel(m.portion)] }],
              }))
            : undefined;
          const renderRow = (row: Row, i: number) => {
            const parts = [...row.parts, ...(row.badges ?? [])].filter(Boolean); // badges show as plain text, not tags
            return (
              <p key={i} className="text-sm leading-snug [overflow-wrap:anywhere]">
                <span className="font-semibold text-app-text">{row.name}</span>
                {parts.length > 0 && <span className="text-textMuted"> · {parts.join(' · ')}</span>}
              </p>
            );
          };
          // one group = one icon; each item is a single line: "label  row  row"
          type Item = { label: string; rows: Row[] };
          const groups: { Icon: LucideIcon; items: Item[] }[] = [
            { Icon: Sun, items: feeds ? feeds.map(f => ({ label: f.title, rows: f.rows })) : [{ label: t('fd.milkDay'), rows: dayRecords.flatMap(milkRowsOf) }] },
            { Icon: Moon, items: [{ label: t('fd.milkNight'), rows: entry.night ? milkRowsOf(entry.night) : [] }] },
            { Icon: Utensils, items: solidFeeds ? solidFeeds.map(f => ({ label: f.title, rows: f.rows })) : [{ label: t('fd.solid'), rows: solids.map(m => ({ name: m.foods.map(foodLabel).join(', '), parts: [m.portion && portionLabel(m.portion)], badges: m.snack ? [t('fd.snack')] : [] })) }] },
            // no label when there is no poop, the row already says it
            { Icon: Baby, items: [poopItems.length ? { label: t('fd.poop'), rows: [{ name: poopItems[0], parts: poopItems.slice(1) }] } : { label: '', rows: [{ name: t('fd.noPoop'), parts: [] }] }] },
          ].filter(g => g.items.some(it => it.rows.length > 0));
          // day and night are only worth showing next to the total when both exist
          const splitTotal = totals.day.ml > 0 && totals.night.ml > 0;
          const isOpen = openIds.includes(entry.id);
          // collapsed card: three small stat tiles (milk, solids, poop); an allergy shows as a red icon in the header
          const tile = 'min-w-0 rounded-2xl bg-peachLight/50 px-3 py-2';
          const tileLabel = 'whitespace-nowrap text-[11px] font-semibold leading-none text-textMuted';
          const dayShare = totals.all.ml > 0 ? (totals.day.ml / totals.all.ml) * 100 : 0;
          return (
            <div
              key={entry.id}
              className={`scroll-mt-4 bg-white rounded-2xl pl-4 pr-1 py-3 ${cardShadow} transition-opacity ${editingEntry?.id === entry.id ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggle(entry.id)} aria-expanded={isOpen} className="flex flex-1 min-w-0 items-center gap-1 text-left text-sm font-bold text-app-text">
                  <span className="truncate">
                    {formatDate(parseISO(entry.date), 'dd MMM yyyy', lang)}
                    {ageWeeks !== null && ageWeeks >= 0 && (
                      <span className="ml-2 text-xs font-medium text-textMuted">{t('growth.weekN', { n: ageWeeks })}</span>
                    )}
                  </span>
                  <ChevronDown size={16} strokeWidth={2.5} className={`flex-shrink-0 text-textMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => { remember(); setShowForm(false); setEditingEntry(entry); }}
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
              <div className="mt-2.5 mr-3"><button type="button" onClick={() => toggle(entry.id)} className="flex w-full items-stretch gap-2 text-left transition-transform active:scale-[0.98]">
                  {totals.all.ml > 0 && (
                    <div className={`${tile} flex-[1.7]`}>
                      <p className="flex items-center gap-1 text-peachDark"><Milk size={14} strokeWidth={2.5} /><span className={tileLabel}>{t('fd.milkTotal')}</span></p>
                      <p className="mt-1.5 text-lg font-extrabold leading-none text-app-text">{totals.all.ml}{plus(totals.all)}<span className="ml-0.5 text-xs font-bold text-textMuted">ml</span></p>
                      {/* sun share of the day vs night */}
                      {splitTotal && (
                        <>
                          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-indigo-300">
                            <div className="bg-amber-300" style={{ width: `${dayShare}%` }} />
                          </div>
                          <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold leading-none text-textMuted">
                            <span className="flex items-center gap-0.5"><Sun size={11} strokeWidth={2.5} className="text-amber-500" />{totals.day.ml}{plus(totals.day)}</span>
                            <span className="flex items-center gap-0.5"><Moon size={11} strokeWidth={2.5} className="text-indigo-400" />{totals.night.ml}{plus(totals.night)}</span>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {solids.length > 0 && (
                    <div className={`${tile} flex-1`}>
                      <p className="flex items-center gap-1 text-peachDark"><Utensils size={14} strokeWidth={2.5} /><span className={tileLabel}>{t('fd.solid')}</span></p>
                      <p className="mt-1.5 text-lg font-extrabold leading-none text-app-text">{solids.length}×</p>
                    </div>
                  )}
                  <div className={`${tile} flex-1`}>
                    <p className="flex items-center gap-1 text-peachDark"><Baby size={14} strokeWidth={2.5} /><span className={tileLabel}>{t('fd.poop')}</span></p>
                    <p className="mt-1.5 text-lg font-extrabold leading-none text-app-text">
                      {entry.poop ? (entry.poop.times !== undefined ? `${entry.poop.times}×` : <Check size={18} strokeWidth={3} />) : '0×'}
                    </p>
                  </div>
                </button>
              </div>
              {/* the detail slides open: a grid row going from 0fr to 1fr animates the height */}
              <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!isOpen} onClick={() => toggle(entry.id)}>
              <div className="overflow-hidden">
              {groups.length > 0 && (
                // one grid for the whole card: icon | label | content, so every column lines up across rows
                <div className="mt-2.5 mr-3 grid grid-cols-[14px_max-content_minmax(0,1fr)] items-baseline gap-x-2 gap-y-0.5">
                  {groups.flatMap((g, gi) => g.items.filter(it => it.rows.length > 0).map((it, i) => ({ Icon: i === 0 ? g.Icon : null, ...it, top: i === 0 && gi > 0 ? 'mt-1.5' : '' }))).map(({ Icon, label, rows, top }, i) => (
                    <Fragment key={i}>
                      <span className={`self-start ${top}`}>{Icon && <Icon size={14} strokeWidth={2.5} className="text-peachDark mt-0.5" />}</span>
                      {label && <span className={`text-xs font-bold text-peachDark ${top}`}>{label}</span>}
                      <div className={`flex flex-wrap items-baseline gap-x-3 ${label ? '' : 'col-span-2'} ${top}`}>{rows.map(renderRow)}</div>
                    </Fragment>
                  ))}
                </div>
              )}
              </div>
              </div>
              {allergyLines.length > 0 && (
                <div className="mt-2 mr-3 rounded-2xl bg-red-50 px-3 py-2 text-red-500">
                  <p className="flex items-center gap-2 text-xs font-bold">
                    <TriangleAlert size={14} strokeWidth={2.5} className="shrink-0" />
                    {t('fd.allergy')}
                  </p>
                  {/* the reactions only show when the card is open */}
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} onClick={() => toggle(entry.id)}>
                    <div className="overflow-hidden">
                      <div className="pl-[22px] pt-1">
                        {/* one reaction per line; long words and new lines wrap inside the card */}
                        {allergyLines.map((a, k) => (
                          <p key={k} className="text-sm font-semibold leading-snug whitespace-pre-wrap [overflow-wrap:anywhere]">{a}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.babyProfile && (
        <div className="px-4 mt-6">
          <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">{t('bp.solids')}</p>
              {state.babyProfile.solidsStartDate && (
                <button onClick={() => setSolidsStart('')} className="text-[11px] font-semibold text-peachDark">
                  {t('bp.clear')}
                </button>
              )}
            </div>
            <DateInput value={state.babyProfile.solidsStartDate ?? ''} min={birthDate} max={new Date().toISOString().split('T')[0]} onChange={setSolidsStart} compact />
            <p className="text-[11px] text-textMuted mt-1">{t('bp.solidsHint')}</p>
          </div>
        </div>
      )}

      <div className="pb-6" />
      {deleteId && (
        <ConfirmDialog
          onConfirm={() => { dispatch({ type: 'DELETE_FOOD_ENTRY', payload: deleteId }); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
