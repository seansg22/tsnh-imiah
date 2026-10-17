import { useEffect, useState } from 'react';
import { Users, ChevronLeft, ChevronRight, Heart, Dumbbell, Brain, Stethoscope, Activity, TriangleAlert, Check } from 'lucide-react';
import { useApp } from '../../context/appStateContext';
import { useBabyAge } from '../../hooks/useBabyAge';
import { getMomStage, momStages, painAreas } from '../../data/momCare';

type Tab = 'pain' | 'exercise' | 'mind' | 'dad' | 'doctor';

const tabs: { key: Tab; label: string; Icon: React.ElementType; on: string }[] = [
  { key: 'pain',     label: 'Pain',     Icon: Activity,    on: 'bg-peachLight text-peachDark' },
  { key: 'exercise', label: 'Move',     Icon: Dumbbell,    on: 'bg-peachLight text-peachDark' },
  { key: 'mind',     label: 'Mind',     Icon: Brain,       on: 'bg-peachLight text-peachDark' },
  { key: 'dad',      label: 'Dad',      Icon: Users,       on: 'bg-peachLight text-peachDark' },
  { key: 'doctor',   label: 'Doctor',   Icon: Stethoscope, on: 'bg-peachLight text-peachDark' },
];

export function MomScreen() {
  const { state, dispatch } = useApp();
  const { weeks, days, currentWeek } = useBabyAge(state.babyProfile?.birthDate ?? null);
  const selectedWeek = state.selectedWeek;
  const stage = getMomStage(selectedWeek);
  const stageIndex = momStages.indexOf(stage);
  const nowIndex = momStages.indexOf(getMomStage(currentWeek));
  const isNow = stageIndex === nowIndex;

  function goStage(delta: number) {
    const target = momStages[stageIndex + delta];
    if (!target) return;
    setDir(delta > 0 ? 1 : -1);
    dispatch({ type: 'SET_SELECTED_WEEK', payload: stageIndex + delta === nowIndex ? currentWeek : target.from });
  }
  const [tab, setTab] = useState<Tab>('pain');
  const [dir, setDir] = useState<1 | -1>(1);
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek });
  }, [currentWeek, dispatch]);

  // Stage changes may drop the chosen area; fall back to the stage's first one
  const activeKey = areaKey && stage.areas.includes(areaKey) ? areaKey : stage.areas[0];
  const area = painAreas[activeKey];

  function toggleDone(item: string) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const doneCount = stage.exercise.filter(e => done.has(e)).length;

  return (
    <div className="fade-in pb-6">
      <style>{`
        @keyframes mom-in-right { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
        @keyframes mom-in-left  { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
        @keyframes mom-pop { 0% { opacity: 0; transform: scale(0.5); } 70% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
        .mom-in-right { animation: mom-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
        .mom-in-left  { animation: mom-in-left 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
        .mom-pop { animation: mom-pop 0.3s ease-out; }
      `}</style>
      {/* Hero */}
      <div className="px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-peachLight/50 p-4 text-app-text shadow-sm">
          <div className="relative flex h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-textMuted">
                {isNow ? `Week ${weeks}, day ${days}` : 'Preview'}
              </p>
              {!isNow && (
                <button
                  onClick={() => {
                    setDir(stageIndex > nowIndex ? -1 : 1);
                    dispatch({ type: 'SET_SELECTED_WEEK', payload: currentWeek });
                  }}
                  className="mom-pop rounded-full bg-peach px-2.5 py-0.5 text-xs font-bold text-white active:scale-95"
                >
                  Today
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goStage(-1)}
                disabled={stageIndex === 0}
                aria-label="Previous stage"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-peachLight text-peachDark transition-all active:scale-90 disabled:opacity-30"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => goStage(1)}
                disabled={stageIndex === momStages.length - 1}
                aria-label="Next stage"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-peach text-white shadow-sm transition-all active:scale-90 disabled:opacity-30"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div key={stageIndex} className={`relative ${dir > 0 ? 'mom-in-right' : 'mom-in-left'}`}>
            <h1 className="mt-1 text-xl font-extrabold leading-tight">
              {stage.title.split(' (')[0]}
              <span className="ml-1.5 text-sm font-bold text-textMuted">
                {stage.title.includes(' (') ? `(${stage.title.split(' (')[1]}` : ''}
              </span>
            </h1>
            <p className="mt-1 text-sm text-textMuted">{stage.focus}</p>
          </div>
        </div>
      </div>

      <section key={`${stageIndex}-${tab}`} className={`px-4 pt-4 ${dir > 0 ? 'mom-in-right' : 'mom-in-left'}`}>
        {/* Colored pill tabs */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {tabs.map(({ key, label, Icon, on }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl text-[11px] font-bold transition-all active:scale-95 ${
                tab === key ? on : 'bg-white text-textMuted shadow-sm'
              }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {tab === 'pain' && (
          <>
            {/* Body map: tap a dot */}
            <div className="relative mx-auto h-64 w-44">
              <svg viewBox="0 0 120 176" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <g className="text-peachLight">
                  <circle cx="60" cy="18" r="12" />
                  <path d="M60 30v10M38 46q22-10 44 0M38 46l-14 52M82 46l14 52M42 50l4 64h28l4-64M46 114l-4 56M74 114l4 56" />
                </g>
              </svg>
              {[
                { k: 'neck',   x: 50, y: 22 },
                { k: 'breast', x: 50, y: 36 },
                { k: 'back',   x: 50, y: 52 },
                { k: 'pelvic', x: 50, y: 68 },
                { k: 'wrist',  x: 20, y: 56 },
              ]
                .filter(d => stage.areas.includes(d.k))
                .map(({ k, x, y }) => (
                  <button
                    key={k}
                    onClick={() => setAreaKey(k)}
                    aria-label={painAreas[k].label}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-2"
                  >
                    <span
                      className={`block h-4 w-4 rounded-full border-2 border-white shadow transition-all ${
                        k === activeKey ? 'scale-150 bg-peachDark ring-4 ring-peach/40' : 'bg-peach'
                      }`}
                    />
                  </button>
                ))}
            </div>
            <p className="text-center text-xs font-semibold text-textMuted">Tap where it hurts</p>
            <h2 className="mt-2 text-center text-lg font-extrabold text-app-text">{area.label}</h2>

            {/* Steps as one timeline */}
            <ol className="relative mt-4 rounded-3xl bg-white p-5 shadow-sm">
              <div className="absolute bottom-8 left-[2.15rem] top-8 w-0.5 bg-peachLight" />
              {area.fix.map((step, i) => (
                <li key={step} className="relative flex gap-4 pb-4 last:pb-0">
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-sm text-app-text/80">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-3 rounded-3xl bg-peachLight/40 p-4">
              <TriangleAlert size={20} className="shrink-0 text-peachDark" />
              <div>
                <p className="text-sm font-extrabold text-app-text">See a doctor if</p>
                <p className="mt-1 text-sm text-textMuted">{area.doctor}</p>
              </div>
            </div>
          </>
        )}

        {tab === 'exercise' && (
          <>
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-peachLight/40 px-4 py-3">
              <p className="text-sm font-extrabold text-peachDark">Today's moves</p>
              <p className="text-xs font-bold text-peachDark">{doneCount} / {stage.exercise.length} done</p>
            </div>
            <ul className="space-y-2">
              {stage.exercise.map(item => {
                const on = done.has(item);
                return (
                  <li key={item}>
                    <button
                      onClick={() => toggleDone(item)}
                      className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left shadow-sm transition-all active:scale-[0.98] ${
                        on ? 'bg-peachLight' : 'bg-white'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          on ? 'border-peach bg-peach text-white' : 'border-peachLight'
                        }`}
                      >
                        {on && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className={`text-sm ${on ? 'text-peachDark line-through' : 'text-textMuted'}`}>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {tab === 'dad' && (
          <ul className="space-y-2">
            {stage.dad.map(item => (
              <li key={item} className="flex gap-3 rounded-2xl bg-white shadow-sm p-3">
                <Users size={16} className="mt-0.5 shrink-0 text-peachDark" />
                <span className="text-sm text-app-text/80">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'mind' && (
          <ul className="space-y-2">
            {stage.mind.map(item => (
              <li key={item} className="flex gap-3 rounded-2xl bg-white shadow-sm p-3">
                <Heart size={16} className="mt-0.5 shrink-0 text-peachDark" />
                <span className="text-sm text-app-text/80">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'doctor' && (
          <ul className="space-y-2">
            {stage.doctor.map(item => (
              <li key={item} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-peachDark" />
                <span className="text-sm text-app-text/80">{item}</span>
              </li>
            ))}
          </ul>
        )}

      </section>
    </div>
  );
}
