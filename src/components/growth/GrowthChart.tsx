import { useState } from 'react';
import type { GrowthEntry } from '../../types';
import { type GrowthMetric, type Gender, whoData, getPercentileAt } from '../../data/whoGrowthData';
import { differenceInWeeks, parseISO } from 'date-fns';
import { useLang } from '../../i18n/langContext';

interface Props {
  entries: GrowthEntry[];
  metric: GrowthMetric;
  birthDate: string;
  gender: Gender;
}

const W = 320;
const H = 180;
const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MAX_WEEK = 52;

function getMetricValue(entry: GrowthEntry, metric: GrowthMetric): number | undefined {
  return entry[metric];
}

export function GrowthChart({ entries, metric, birthDate, gender }: Props) {
  const { t } = useLang();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  const data = whoData[gender][metric];
  const yMin = data[0].p3 * 0.97;
  const yMax = data[data.length - 1].p97 * 1.02;

  function toX(week: number) {
    return PAD.left + (week / MAX_WEEK) * CHART_W;
  }
  function toY(val: number) {
    return PAD.top + CHART_H - ((val - yMin) / (yMax - yMin)) * CHART_H;
  }

  // Reference band polygon (P3 forward then P97 backward)
  const p3Points = data.map(d => `${toX(d.week)},${toY(d.p3)}`).join(' ');
  const p97PointsRev = [...data].reverse().map(d => `${toX(d.week)},${toY(d.p97)}`).join(' ');
  const bandPolygon = `${p3Points} ${p97PointsRev}`;

  // P50 median line
  const p50Line = data.map(d => `${toX(d.week)},${toY(d.p50)}`).join(' ');

  // Actual measurements
  const measured = entries
    .map(e => {
      const val = getMetricValue(e, metric);
      if (val === undefined) return null;
      const weeks = differenceInWeeks(parseISO(e.date), parseISO(birthDate));
      if (weeks < 0 || weeks > MAX_WEEK) return null;
      return { week: weeks, val, date: e.date };
    })
    .filter(Boolean) as { week: number; val: number; date: string }[];

  const actualLine = measured.map(p => `${toX(p.week)},${toY(p.val)}`).join(' ');

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    yMin + (i / tickCount) * (yMax - yMin)
  );

  // X-axis ticks: every 13 weeks
  const xTicks = [0, 13, 26, 39, 52];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: '180px' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Band P3–P97 */}
        <polygon points={bandPolygon} fill="#FFAB76" fillOpacity="0.18" />

        {/* P50 median */}
        <polyline
          points={p50Line}
          fill="none"
          stroke="#E8875A"
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity="0.6"
        />

        {/* P3 border */}
        <polyline
          points={p3Points}
          fill="none"
          stroke="#FFAB76"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* P97 border */}
        <polyline
          points={[...data].reverse().map(d => `${toX(d.week)},${toY(d.p97)}`).join(' ')}
          fill="none"
          stroke="#FFAB76"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* Actual data line */}
        {measured.length >= 2 && (
          <polyline
            points={actualLine}
            fill="none"
            stroke="#E8875A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Actual data dots */}
        {measured.map((p, i) => {
          const cx = toX(p.week);
          const cy = toY(p.val);
          const ref = getPercentileAt(metric, p.week, gender);
          const inRange = p.val >= ref.p3 && p.val <= ref.p97;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="4"
              fill={inRange ? '#E8875A' : '#ef4444'}
              stroke="white"
              strokeWidth="1.5"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                setTooltip(prev =>
                  prev && Math.abs(prev.x - cx) < 1 ? null : { x: cx, y: cy, label: p.val.toString() }
                )
              }
            />
          );
        })}

        {/* Y-axis ticks */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left - 3}
              y1={toY(v)}
              x2={PAD.left}
              y2={toY(v)}
              stroke="#9B7B6E"
              strokeWidth="0.8"
            />
            <text
              x={PAD.left - 5}
              y={toY(v)}
              fontSize="8"
              fill="#9B7B6E"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(v * 10) / 10}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {xTicks.map(w => (
          <g key={w}>
            <line
              x1={toX(w)}
              y1={PAD.top + CHART_H}
              x2={toX(w)}
              y2={PAD.top + CHART_H + 3}
              stroke="#9B7B6E"
              strokeWidth="0.8"
            />
            <text
              x={toX(w)}
              y={PAD.top + CHART_H + 10}
              fontSize="8"
              fill="#9B7B6E"
              textAnchor="middle"
            >
              {w === 0 ? t('chart.birth') : t('chart.week', { n: w })}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + CHART_H}
          stroke="#9B7B6E"
          strokeWidth="0.8"
        />
        <line
          x1={PAD.left}
          y1={PAD.top + CHART_H}
          x2={PAD.left + CHART_W}
          y2={PAD.top + CHART_H}
          stroke="#9B7B6E"
          strokeWidth="0.8"
        />

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x - 18, W - PAD.right - 40)}
              y={tooltip.y - 22}
              width={38}
              height={16}
              rx="4"
              fill="#3D2B1F"
              fillOpacity="0.85"
            />
            <text
              x={Math.min(tooltip.x - 18, W - PAD.right - 40) + 19}
              y={tooltip.y - 14}
              fontSize="8.5"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tooltip.label}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 px-1">
        <div className="flex items-center gap-1">
          <div className="w-6 h-2 rounded-sm" style={{ background: '#FFAB76', opacity: 0.35 }} />
          <span className="text-xs text-textMuted">P3–P97</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="18" height="8">
            <line x1="0" y1="4" x2="18" y2="4" stroke="#E8875A" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.6" />
          </svg>
          <span className="text-xs text-textMuted">{t('chart.median')}</span>
        </div>
        {measured.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-peachDark" />
            <span className="text-xs text-textMuted">{t('chart.measured')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
