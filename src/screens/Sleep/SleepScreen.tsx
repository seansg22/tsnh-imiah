import { Fragment, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Sun, Moon, Clock, ChevronDown } from 'lucide-react';
import { parseISO, differenceInWeeks } from 'date-fns';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { SleepForm } from '../../components/sleep/SleepForm';
import { formatDuration, groupByDay, sleepMinutes } from '../../lib/sleep';
import type { SleepEntry, SleepKind } from '../../types';
import { cardShadow } from '../../components/shared/cardStyle';

export function SleepScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  // kind is set when adding; editing carries the entry (its kind decides the form)
  const [form, setForm] = useState<{ kind: SleepKind; entry?: SleepEntry } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<string[]>([]); // days showing the detail, the rest show the summary
  const toggle = (id: string) => setOpenIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));

  const birthDate = state.babyProfile?.birthDate ?? '';
  const entries = state.sleepEntries;
  const days = groupByDay(entries);

  // the popup opens over the page: remember where we were and go back there when it closes
  const savedY = useRef<number | null>(null);
  const open = (next: { kind: SleepKind; entry?: SleepEntry }) => {
    savedY.current = window.scrollY;
    setForm(next);
  };
  useEffect(() => {
    if (form || savedY.current === null) return;
    window.scrollTo({ top: savedY.current, behavior: 'instant' });
    savedY.current = null;
  }, [form]);

  function handleSave(entry: SleepEntry) {
    dispatch({ type: 'UPSERT_SLEEP_ENTRY', payload: entry });
    setForm(null);
  }

  // last sleep of the same kind, so adding starts from the usual times
  const lastOf = (kind: SleepKind) => [...entries].filter(e => e.kind === kind).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).pop();

  const row = (e: SleepEntry) => {
    const details = [
      formatDuration(sleepMinutes(e.start, e.end)),
      e.kind === 'night' && e.wakeUps !== undefined && t('sl.wakeN', { n: e.wakeUps }),
      e.kind === 'night' && e.wakeFeed && (e.wakeFeedMin !== undefined ? t('sl.fedWakeRowMin', { n: e.wakeFeedMin }) : t('sl.fedWakeRow')),
      e.fallAsleepMin !== undefined && t('sl.fell', { n: e.fallAsleepMin }),
      e.fellAsleep?.length && e.fellAsleep.map(w => t(`sl.way.${w}` as UiKey)).join(' + '),
    ].filter(Boolean);
    return (
      <div key={e.id} className="flex items-start gap-1">
        <p className="flex-1 min-w-0 text-sm leading-snug">
          <span className="font-semibold text-app-text">{e.start} - {e.end}</span>
          <span className="text-textMuted"> · {details.join(' · ')}</span>
        </p>
        <button onClick={ev => { ev.stopPropagation(); open({ kind: e.kind, entry: e }); }} className="p-1 text-textMuted hover:text-peach transition-colors flex-shrink-0">
          <Pencil size={14} strokeWidth={2} />
        </button>
        <button onClick={ev => { ev.stopPropagation(); setDeleteId(e.id); }} className="p-1 text-textMuted hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
    );
  };

  const addBtn = 'flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peach/60 bg-white/60 text-peachDark text-xs font-bold hover:bg-white transition-colors';

  return (
    <div className="fade-in">

      {/* naps and night sleep are added separately; a day can have many naps */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-2">
        <button onClick={() => open({ kind: 'nap' })} className={addBtn}>
          <Plus size={14} strokeWidth={2.5} />
          {t('sl.addNap')}
        </button>
        <button onClick={() => open({ kind: 'night' })} className={addBtn}>
          <Plus size={14} strokeWidth={2.5} />
          {t('sl.addNight')}
        </button>
      </div>

      {form && (
        <SleepForm
          key={form.entry?.id ?? form.kind}
          kind={form.kind}
          initialEntry={form.entry}
          prefill={lastOf(form.kind)}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}

      <div className="px-4 space-y-2">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1">{t('sl.history')}</p>
        {days.length === 0 && <p className="text-xs text-textMuted">{t('sl.empty')}</p>}
        {days.map(day => {
          const ageWeeks = birthDate ? differenceInWeeks(parseISO(day.date), parseISO(birthDate)) : null;
          const isOpen = openIds.includes(day.date);
          const wakeUps = day.nights.reduce((sum, e) => sum + (e.wakeUps ?? 0), 0);
          const napShare = day.totalMin > 0 ? (day.napMin / day.totalMin) * 100 : 0;
          const tile = 'min-w-0 rounded-2xl bg-peachLight/50 px-3 py-2';
          const tileLabel = 'whitespace-nowrap text-[11px] font-semibold leading-none text-textMuted';
          const tileValue = 'mt-1.5 text-lg font-extrabold leading-none text-app-text';
          const tileSub = 'mt-1.5 truncate text-[11px] font-semibold leading-none text-textMuted';
          // detail: one line per sleep, one icon per group, all rows share the same columns
          const rows = [
            ...day.naps.map((e, i) => ({ e, Icon: i === 0 ? Sun : null, tone: 'text-amber-500' })),
            ...day.nights.map((e, i) => ({ e, Icon: i === 0 ? Moon : null, tone: 'text-indigo-400' })),
          ];
          return (
            <div key={day.date} data-sleep-day onClick={() => toggle(day.date)} className={`cursor-pointer scroll-mt-4 bg-white rounded-2xl px-4 py-3 ${cardShadow}`}>
              <button type="button" aria-expanded={isOpen} className="flex w-full items-center gap-1 text-left text-sm font-bold text-app-text">
                <span className="truncate">
                  {formatDate(parseISO(day.date), 'dd MMM yyyy', lang)}
                  {ageWeeks !== null && ageWeeks >= 0 && (
                    <span className="ml-2 text-xs font-medium text-textMuted">{t('growth.weekN', { n: ageWeeks })}</span>
                  )}
                </span>
                <ChevronDown size={16} strokeWidth={2.5} className={`flex-shrink-0 text-textMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* summary: total with a naps | night bar, then a tile each for naps and night (their icon colors are the bar legend) */}
              <button type="button" className="mt-2.5 flex w-full items-stretch gap-2 text-left transition-transform active:scale-[0.98]">
                <div className={`${tile} flex-[1.4]`}>
                  <p className="flex items-center gap-1 text-peachDark"><Clock size={14} strokeWidth={2.5} /><span className={`${tileLabel} truncate`}>{t('sl.total')}</span></p>
                  <p className={tileValue}>{formatDuration(day.totalMin)}</p>
                  {day.napMin > 0 && day.nightMin > 0 && (
                    <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-indigo-300">
                      <div className="bg-amber-300" style={{ width: `${napShare}%` }} />
                    </div>
                  )}
                </div>
                {day.naps.length > 0 && (
                  <div className={`${tile} flex-1`}>
                    <p className="flex items-center gap-1 text-amber-500"><Sun size={14} strokeWidth={2.5} /><span className={tileLabel}>{t('sl.naps')}</span></p>
                    <p className={tileValue}>{formatDuration(day.napMin)}</p>
                    <p className={tileSub}>{day.naps.length}×</p>
                  </div>
                )}
                {day.nights.length > 0 && (
                  <div className={`${tile} flex-1`}>
                    <p className="flex items-center gap-1 text-indigo-400"><Moon size={14} strokeWidth={2.5} /><span className={tileLabel}>{t('sl.night')}</span></p>
                    <p className={tileValue}>{formatDuration(day.nightMin)}</p>
                    {wakeUps > 0 && <p className={tileSub}>{t('sl.wakeN', { n: wakeUps })}</p>}
                  </div>
                )}
              </button>

              {/* the detail slides open: a grid row going from 0fr to 1fr animates the height */}
              <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!isOpen}>
                <div className="overflow-hidden">
                  <div className="mt-2.5 grid grid-cols-[14px_minmax(0,1fr)] items-start gap-x-2 gap-y-1.5">
                    {rows.map(({ e, Icon, tone }) => (
                      <Fragment key={e.id}>
                        <span>{Icon && <Icon size={14} strokeWidth={2.5} className={`mt-0.5 ${tone}`} />}</span>
                        {row(e)}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pb-6" />
      {deleteId && (
        <ConfirmDialog
          onConfirm={() => { dispatch({ type: 'DELETE_SLEEP_ENTRY', payload: deleteId }); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
