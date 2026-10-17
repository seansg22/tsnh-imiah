import { useRef, useState } from 'react';
import type { GrowthEntry } from '../../types';
import {
  type GrowthMetric,
  type Gender,
  MAX_WEEK,
  PERCENTILE_LINES,
  Z_LINES,
  valueAtPercentile,
  valueAtZ,
  zScoreOf,
  percentileOfZ,
} from '../../data/whoGrowthData';
import { differenceInDays, parseISO } from 'date-fns';
import { useLang } from '../../i18n/langContext';

interface Props {
  entries: GrowthEntry[];
  metric: GrowthMetric;
  birthDate: string;
  gender: Gender;
}

type Mode = 'value' | 'percentile' | 'z';
type View = { start: number; end: number };

const W = 320;
const H = 210;
const PAD = { top: 12, right: 48, bottom: 30, left: 40 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MIN_SPAN = 8;
const WEEKS_PER_MONTH = 52 / 12;
const RANGES = [
  { key: 'chart.months', n: 3, weeks: 13 },
  { key: 'chart.months', n: 6, weeks: 26 },
  { key: 'chart.years', n: 1, weeks: 52 },
  { key: 'chart.years', n: 2, weeks: 104 },
] as const;

const PREFS_KEY = 'baby-day:growth-chart';

function loadPrefs(): { mode?: Mode; weeks?: number } {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function savePrefs(patch: { mode?: Mode; weeks?: number }) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...patch }));
  } catch {
    // storage unavailable, preference just won't persist
  }
}

function clampView(start: number, end: number): View {
  const span = Math.min(MAX_WEEK, Math.max(MIN_SPAN, end - start));
  const s = Math.max(0, Math.min(MAX_WEEK - span, start));
  return { start: s, end: s + span };
}

export function GrowthChart({ entries, metric, birthDate, gender }: Props) {
  const { t } = useLang();
  const [prefs] = useState(loadPrefs);
  const [mode, setModeState] = useState<Mode>(
    prefs.mode === 'percentile' || prefs.mode === 'z' ? prefs.mode : 'value',
  );
  const setMode = (m: Mode) => {
    setModeState(m);
    savePrefs({ mode: m });
  };

  const measured = entries
    .map(e => {
      const val = e[metric];
      if (val === undefined) return null;
      const week = differenceInDays(parseISO(e.date), parseISO(birthDate)) / 7;
      if (week < 0 || week > MAX_WEEK) return null;
      return { week, val, id: e.id };
    })
    .filter(Boolean)
    .sort((a, b) => a!.week - b!.week) as { week: number; val: number; id: string }[];

  // Default view: smallest range that holds every measurement
  const latest = measured.length ? measured[measured.length - 1].week : 0;
  const defaultWeeks = (RANGES.find(r => r.weeks >= latest + 2) ?? RANGES[RANGES.length - 1]).weeks;
  // View of `weeks` wide with today's age in the middle
  const centered = (weeks: number) => {
    const today = differenceInDays(new Date(), parseISO(birthDate)) / 7;
    return clampView(today - weeks / 2, today + weeks / 2);
  };
  const savedWeeks = RANGES.find(r => r.weeks === prefs.weeks)?.weeks;
  const [view, setView] = useState<View>(() => centered(savedWeeks ?? defaultWeeks));

  // Gesture state lives in refs
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, number>()); // pointerId -> client x
  const gesture = useRef({ dist: 0, moved: false });

  const lines = mode === 'value'
    ? ([3, 50, 97] as const).map(p => ({ id: p, label: `P${p}`, median: p === 50, at: (w: number) => valueAtPercentile(metric, w, gender, p) }))
    : mode === 'percentile'
    ? PERCENTILE_LINES.map(p => ({ id: p, label: `P${p}`, median: p === 50, at: (w: number) => valueAtPercentile(metric, w, gender, p) }))
    : Z_LINES.map(z => ({ id: z, label: z > 0 ? `+${z}` : `${z}`, median: z === 0, at: (w: number) => valueAtZ(metric, w, gender, z) }));
  const outerLo = lines[0];
  const outerHi = lines[lines.length - 1];

  const STEPS = 48;
  const sample = (f: (w: number) => number) =>
    Array.from({ length: STEPS + 1 }, (_, i) => {
      const w = view.start + ((view.end - view.start) * i) / STEPS;
      return { w, v: f(w) };
    });
  const loPts = sample(outerLo.at);
  const hiPts = sample(outerHi.at);

  const visibleMeasured = measured.filter(p => p.week >= view.start && p.week <= view.end);
  const yMin = Math.min(...loPts.map(p => p.v), ...visibleMeasured.map(p => p.val)) * 0.98;
  const yMax = Math.max(...hiPts.map(p => p.v), ...visibleMeasured.map(p => p.val)) * 1.02;

  const toX = (week: number) => PAD.left + ((week - view.start) / (view.end - view.start)) * CHART_W;
  const toY = (val: number) => PAD.top + CHART_H - ((val - yMin) / (yMax - yMin)) * CHART_H;
  const pts = (arr: { w: number; v: number }[]) => arr.map(p => `${toX(p.w)},${toY(p.v)}`).join(' ');

  const bandPolygon = `${pts(loPts)} ${pts([...hiPts].reverse())}`;

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i / 4) * (yMax - yMin));
  const span = view.end - view.start;
  const xTicks: { week: number; label: string }[] = [];
  if (span <= 20) {
    for (let w = Math.ceil(view.start / 2) * 2; w <= view.end; w += 2) {
      xTicks.push({ week: w, label: w === 0 ? t('chart.birth') : t('chart.week', { n: w }) });
    }
  } else {
    // widen the step until "month N" labels do not touch
    const pxPerMonth = (CHART_W * WEEKS_PER_MONTH) / span;
    const step = [1, 2, 3, 6, 12].find(n => n * pxPerMonth >= 42) ?? 12;
    for (let m = Math.ceil(view.start / WEEKS_PER_MONTH / step) * step; m * WEEKS_PER_MONTH <= view.end; m += step) {
      xTicks.push({ week: m * WEEKS_PER_MONTH, label: m === 0 ? t('chart.birth') : t('chart.monthN', { n: m }) });
    }
  }

  function zoomAt(centerWeek: number, factor: number) {
    const v = view;
    const ratio = (centerWeek - v.start) / (v.end - v.start);
    const newSpan = Math.min(MAX_WEEK, Math.max(MIN_SPAN, (v.end - v.start) * factor));
    const start = centerWeek - ratio * newSpan;
    setView(clampView(start, start + newSpan));
  }

  const weekAtClientX = (clientX: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const v = view;
    return v.start + ((x - PAD.left) / CHART_W) * (v.end - v.start);
  };
  const weeksPerPx = () => (view.end - view.start) / (svgRef.current!.getBoundingClientRect().width * (CHART_W / W));

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId); // keep events when the pointer leaves the chart
    pointers.current.set(e.pointerId, e.clientX);
    gesture.current = { dist: 0, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const map = pointers.current;
    if (!map.has(e.pointerId)) return;
    const prevX = map.get(e.pointerId)!;
    map.set(e.pointerId, e.clientX);
    if (map.size === 1) {
      const dx = e.clientX - prevX;
      if (!gesture.current.moved && Math.abs(dx) < 1) return;
      gesture.current.moved = true;
      const shift = dx * weeksPerPx();
      const v = view;
      setView(clampView(v.start - shift, v.end - shift));
    } else if (map.size === 2) {
      gesture.current.moved = true;
      const [a, b] = [...map.values()];
      const dist = Math.abs(a - b);
      if (gesture.current.dist > 0 && dist > 0) {
        zoomAt(weekAtClientX((a + b) / 2), gesture.current.dist / dist);
      }
      gesture.current.dist = dist;
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    gesture.current.dist = 0;
  }

  const pill = (active: boolean) =>
    `px-2.5 py-1 rounded-full text-xs font-bold transition-all ${active ? 'bg-peach text-white' : 'bg-warm text-textMuted'}`;

  return (
    <div>
      {/* View mode */}
      <div className="flex gap-2 mb-2">
        <button className={pill(mode === 'value')} onClick={() => setMode('value')}>
          {t('chart.modeValue')}
        </button>
        <button className={pill(mode === 'percentile')} onClick={() => setMode('percentile')}>
          {t('chart.modePercentile')}
        </button>
        <button className={pill(mode === 'z')} onClick={() => setMode('z')}>
          {t('chart.modeZ')}
        </button>
      </div>

      <p className="text-xs text-textMuted mb-2">{t(`chart.explain.${mode}`)}</p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onLostPointerCapture={onPointerUp}
      >
        <defs>
          <clipPath id="plot">
            <rect x={PAD.left} y={PAD.top} width={CHART_W} height={CHART_H} />
          </clipPath>
        </defs>

        <g clipPath="url(#plot)">
          <polygon points={bandPolygon} fill="#FFAB76" fillOpacity="0.18" />

          {lines.map(l => (
            <polyline
              key={l.id}
              points={pts(sample(l.at))}
              fill="none"
              stroke={l.median ? '#E8875A' : '#FFAB76'}
              strokeWidth={l.median ? 1.2 : 0.8}
              strokeDasharray={l.median ? '4 3' : undefined}
              strokeOpacity={l.median ? 0.7 : 0.6}
            />
          ))}

          {measured.length >= 2 && (
            <polyline
              points={measured.map(p => `${toX(p.week)},${toY(p.val)}`).join(' ')}
              fill="none"
              stroke="#E8875A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {measured.map(p => {
            const z = zScoreOf(metric, p.week, gender, p.val);
            const pc = percentileOfZ(z);
            return (
              <circle
                key={p.id}
                cx={toX(p.week)}
                cy={toY(p.val)}
                r="4"
                fill={pc >= 3 && pc <= 97 ? '#E8875A' : '#ef4444'}
                stroke="white"
                strokeWidth="1.5"
              />
            );
          })}
        </g>

        {/* Line labels */}
        {lines.map(l => (
          <text
            key={l.id}
            x={PAD.left + CHART_W + 3}
            y={toY(l.at(view.end))}
            fontSize="9"
            fill="#9B7B6E"
            dominantBaseline="middle"
          >
            {mode === 'value' ? `${l.label} ${Math.round(l.at(view.end) * 10) / 10}` : l.label}
          </text>
        ))}

        {/* Y ticks */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left - 3} y1={toY(v)} x2={PAD.left} y2={toY(v)} stroke="#9B7B6E" strokeWidth="0.8" />
            <text x={PAD.left - 5} y={toY(v)} fontSize="10" fill="#9B7B6E" textAnchor="end" dominantBaseline="middle">
              {Math.round(v * 10) / 10}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {xTicks.map(tk => (
          <g key={tk.week}>
            <line x1={toX(tk.week)} y1={PAD.top + CHART_H} x2={toX(tk.week)} y2={PAD.top + CHART_H + 3} stroke="#9B7B6E" strokeWidth="0.8" />
            <text x={toX(tk.week)} y={PAD.top + CHART_H + 13} fontSize="10" fill="#9B7B6E" textAnchor="middle">
              {tk.label}
            </text>
          </g>
        ))}

        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke="#9B7B6E" strokeWidth="0.8" />
        <line x1={PAD.left} y1={PAD.top + CHART_H} x2={PAD.left + CHART_W} y2={PAD.top + CHART_H} stroke="#9B7B6E" strokeWidth="0.8" />
      </svg>

      {/* Zoom controls */}
      <div className="flex items-center gap-1.5 mt-2">
        {RANGES.map(r => (
          <button
            key={r.weeks}
            className={pill(Math.abs(view.end - view.start - r.weeks) < 0.5)}
            onClick={() => {
              setView(centered(r.weeks));
              savePrefs({ weeks: r.weeks });
            }}
          >
            {t(r.key, { n: r.n })}
          </button>
        ))}
        <button className={`${pill(false)} ml-auto`} onClick={() => setView(centered(view.end - view.start))}>
          {t('chart.today')}
        </button>
      </div>
      <p className="text-xs text-textMuted mt-2">{t('chart.hint')}</p>

    </div>
  );
}
