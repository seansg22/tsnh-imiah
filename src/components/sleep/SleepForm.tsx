import { useState } from 'react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import type { SleepEntry, SleepKind } from '../../types';
import { DateInput } from '../shared/DateInput';
import { WheelPicker } from '../shared/WheelPicker';
import { Chip } from '../shared/Chip';
import { CheckBox } from '../shared/CheckBox';
import { FullPageForm } from '../shared/FullPageForm';
import { useApp } from '../../context/appStateContext';
import { SLEEP_WAYS, formatDuration, hasNightSleep, hhmm, sleepMinutes } from '../../lib/sleep';
import { withValue } from '../../lib/foodForm';
import { cardShadow } from '../shared/cardStyle';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const FALL_ASLEEP = Array.from({ length: 24 }, (_, i) => (i + 1) * 5); // 5..120 min
const WAKE_UPS = Array.from({ length: 10 }, (_, i) => i + 1);
const FEED_MIN = Array.from({ length: 18 }, (_, i) => (i + 1) * 5); // 5..90 min

const labelCls = 'text-sm font-semibold text-textMuted block mb-1.5';
const sectionCls = `rounded-2xl bg-white p-4 space-y-3 ${cardShadow}`;

const DEFAULT_TIMES: Record<SleepKind, [string, string]> = { nap: ['13:00', '14:00'], night: ['20:00', '06:00'] };
const part = (t: string) => t.split(':').map(Number) as [number, number];

interface Props {
  kind: SleepKind;
  onSave: (entry: SleepEntry) => void;
  onCancel: () => void;
  initialEntry?: SleepEntry;
  prefill?: SleepEntry; // when adding: the last sleep of this kind, so usual times are already set
}

// hour and minute wheels for one time of day
function TimeWheels({ label, hour, minute, onHour, onMinute }: { label: string; hour: number; minute: number; onHour: (v: number) => void; onMinute: (v: number) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <WheelPicker required options={HOURS} value={hour} onChange={v => v !== undefined && onHour(v)} />
        <span className="font-extrabold text-app-text">:</span>
        <WheelPicker required options={withValue(MINUTES, minute)} value={minute} onChange={v => v !== undefined && onMinute(v)} />
      </div>
    </div>
  );
}

export function SleepForm({ kind, onSave, onCancel, initialEntry, prefill }: Props) {
  const { t } = useLang();
  const today = new Date().toISOString().split('T')[0];
  const seed = initialEntry ?? prefill;
  const [date, setDate] = useState(initialEntry?.date ?? today);
  const [newId] = useState(() => `${kind}-${Date.now()}`); // a new sleep gets its id once
  const [sh, sm] = part(seed?.start ?? DEFAULT_TIMES[kind][0]);
  const [eh, em] = part(seed?.end ?? DEFAULT_TIMES[kind][1]);
  const [startH, setStartH] = useState(sh);
  const [startM, setStartM] = useState(sm);
  const [endH, setEndH] = useState(eh);
  const [endM, setEndM] = useState(em);
  const [fallMin, setFallMin] = useState<number | undefined>(seed?.fallAsleepMin);
  const [wakeUps, setWakeUps] = useState<number | undefined>(initialEntry?.wakeUps); // never copied from the last night
  const [fed, setFed] = useState(!!initialEntry?.wakeFeed); // like wake-ups, never copied from the last night
  const [fedMin, setFedMin] = useState<number | undefined>(initialEntry?.wakeFeedMin);
  const [ways, setWays] = useState<string[]>(seed?.fellAsleep ?? []);

  const start = hhmm(startH, startM);
  const end = hhmm(endH, endM);
  const sameTime = start === end; // would count as 24 hours
  const { state } = useApp();
  const nightTaken = kind === 'night' && hasNightSleep(state.sleepEntries, date, initialEntry?.id);
  const blocked = sameTime || nightTaken;
  const minutes = sleepMinutes(start, end);

  function handleSave() {
    if (blocked) return;
    onSave({
      id: initialEntry?.id ?? newId,
      date,
      kind,
      start,
      end,
      ...(fallMin !== undefined ? { fallAsleepMin: fallMin } : {}),
      ...(kind === 'night' && wakeUps !== undefined ? { wakeUps } : {}),
      ...(kind === 'night' && fed ? { wakeFeed: true, ...(fedMin !== undefined ? { wakeFeedMin: fedMin } : {}) } : {}),
      ...(ways.length ? { fellAsleep: ways } : {}),
    });
  }

  const title = kind === 'nap' ? (initialEntry ? t('sl.editNap') : t('sl.addNap')) : initialEntry ? t('sl.editNight') : t('sl.addNight');

  return (
    <FullPageForm
      title={title}
      onClose={onCancel}
      footer={
        <button
          onClick={handleSave}
          disabled={blocked}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-peach text-white disabled:opacity-40 transition-opacity"
        >
          {initialEntry ? t('fd.update') : t('fd.save')}
        </button>
      }
    >
      <div>
        <label className={labelCls}>{t('fd.date')}</label>
        <DateInput compact value={date} max={today} onChange={setDate} />
        {nightTaken && <p className="mt-1.5 text-sm font-semibold text-red-500">{t('sl.nightTaken')}</p>}
      </div>

      <section className={sectionCls}>
        <TimeWheels label={t('sl.start')} hour={startH} minute={startM} onHour={setStartH} onMinute={setStartM} />
        <TimeWheels label={t('sl.end')} hour={endH} minute={endM} onHour={setEndH} onMinute={setEndM} />
        {!sameTime && (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-bold text-app-text">{t('sl.slept')}</span>
            <span className="font-extrabold text-peachDark">{formatDuration(minutes)}</span>
          </div>
        )}
      </section>

      <section className={sectionCls}>
        <div>
          <label className={labelCls}>{t('sl.fallAsleep')}</label>
          <WheelPicker options={withValue(FALL_ASLEEP, fallMin)} value={fallMin} onChange={setFallMin} unit={t('sl.min')} />
        </div>
        {kind === 'night' && (
          <div>
            <label className={labelCls}>{t('sl.wakeUps')}</label>
            <WheelPicker options={withValue(WAKE_UPS, wakeUps)} value={wakeUps} onChange={setWakeUps} />
          </div>
        )}
        {kind === 'night' && (
          <div className="space-y-2">
            <CheckBox checked={fed} onChange={() => setFed(v => !v)} label={t('sl.fedWake')} />
            {fed && (
              <div>
                <label className={labelCls}>{t('sl.fedFor')}</label>
                <WheelPicker options={withValue(FEED_MIN, fedMin)} value={fedMin} onChange={setFedMin} unit={t('sl.min')} />
              </div>
            )}
          </div>
        )}
        <div>
          <label className={labelCls}>{t('sl.fellAsleep')}</label>
          <div className="flex flex-wrap gap-2">
            {SLEEP_WAYS.map(w => (
              <Chip key={w} on={ways.includes(w)} onClick={() => setWays(p => (p.includes(w) ? p.filter(x => x !== w) : [...p, w]))}>
                {t(`sl.way.${w}` as UiKey)}
              </Chip>
            ))}
          </div>
        </div>
      </section>
    </FullPageForm>
  );
}
