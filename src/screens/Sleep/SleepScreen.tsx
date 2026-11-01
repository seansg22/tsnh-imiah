import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Sun, Moon, Sparkles } from 'lucide-react';
import { parseISO, differenceInWeeks } from 'date-fns';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { useApp } from '../../context/appStateContext';
import { AdviceModal } from '../../components/ai/AdviceModal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { SleepForm } from '../../components/sleep/SleepForm';
import { formatDuration, groupByDay, sleepMinutes } from '../../lib/sleep';
import type { SleepEntry, SleepKind } from '../../types';

export function SleepScreen() {
  const { t, lang } = useLang();
  const { state, dispatch } = useApp();
  // kind is set when adding; editing carries the entry (its kind decides the form)
  const [form, setForm] = useState<{ kind: SleepKind; entry?: SleepEntry } | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
        <button onClick={() => open({ kind: e.kind, entry: e })} className="p-1 text-textMuted hover:text-peach transition-colors flex-shrink-0">
          <Pencil size={14} strokeWidth={2} />
        </button>
        <button onClick={() => setDeleteId(e.id)} className="p-1 text-textMuted hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
    );
  };

  const addBtn = 'flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peachLight text-peachDark text-xs font-bold hover:bg-peachLight/30 transition-colors';

  return (
    <div className="fade-in">
      <div className="px-4 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">{t('sl.title')}</h1>
          <p className="text-textMuted text-sm font-medium mt-1">{t('sl.subtitle')}</p>
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
          const block = (title: string, Icon: typeof Sun, list: SleepEntry[], minutes: number) =>
            list.length > 0 && (
              <div className="flex gap-2">
                <Icon size={14} strokeWidth={2.5} className="text-peachDark mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-peachDark">{title} · {formatDuration(minutes)}</p>
                  {list.map(row)}
                </div>
              </div>
            );
          return (
            <div key={day.date} data-sleep-day className="scroll-mt-4 bg-white rounded-xl px-4 py-2.5 shadow-sm">
              <p className="text-sm font-bold text-app-text">
                {formatDate(parseISO(day.date), 'dd MMM yyyy', lang)}
                {ageWeeks !== null && ageWeeks >= 0 && (
                  <span className="ml-2 text-xs font-medium text-textMuted">{t('growth.weekN', { n: ageWeeks })}</span>
                )}
              </p>
              <div className="mt-2 space-y-2.5">
                {block(t('sl.naps'), Sun, day.naps, day.napMin)}
                {block(t('sl.night'), Moon, day.nights, day.nightMin)}
                <p className="flex items-baseline gap-2 text-sm">
                  <span className="font-bold text-app-text">{t('sl.total')}</span>
                  <span className="font-extrabold text-peachDark">{formatDuration(day.totalMin)}</span>
                </p>
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
      {showAdvice && <AdviceModal kind="sleep" onClose={() => setShowAdvice(false)} />}
    </div>
  );
}
