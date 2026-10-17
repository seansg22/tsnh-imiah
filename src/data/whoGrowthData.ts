// WHO Child Growth Standards, computed from weekly LMS values (see whoLms.ts).

import { whoLms } from './whoLms';

export type GrowthMetric = 'weight' | 'length' | 'head';
export type Gender = 'girl' | 'boy';

export const MAX_WEEK = whoLms.girl.weight.length - 1;

export const PERCENTILE_LINES = [3, 15, 50, 85, 97] as const;
export const Z_LINES = [-3, -2, 0, 2, 3] as const;

function lms(metric: GrowthMetric, week: number, gender: Gender) {
  const rows = whoLms[gender][metric];
  const w = Math.max(0, Math.min(MAX_WEEK, week));
  const lo = Math.floor(w);
  const hi = Math.min(MAX_WEEK, lo + 1);
  const t = w - lo;
  return rows[lo].map((v, i) => v + (rows[hi][i] - v) * t);
}

// Measurement that sits at a given z-score for this age
export function valueAtZ(metric: GrowthMetric, week: number, gender: Gender, z: number): number {
  const [L, M, S] = lms(metric, week, gender);
  return L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L);
}

export function zScoreOf(metric: GrowthMetric, week: number, gender: Gender, value: number): number {
  const [L, M, S] = lms(metric, week, gender);
  return L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
}

// Standard normal CDF (Abramowitz-Stegun 7.1.26), returns 0..100
export function percentileOfZ(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 50 * (1 + Math.sign(z) * erf);
}

export function valueAtPercentile(metric: GrowthMetric, week: number, gender: Gender, p: number): number {
  return valueAtZ(metric, week, gender, zOfPercentile(p));
}

// Inverse of percentileOfZ by bisection (only used for the few fixed lines)
function zOfPercentile(p: number): number {
  let lo = -5;
  let hi = 5;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (percentileOfZ(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function getPercentileAt(
  metric: GrowthMetric,
  week: number,
  gender: Gender = 'girl',
): { p3: number; p50: number; p97: number } {
  return {
    p3: valueAtPercentile(metric, week, gender, 3),
    p50: valueAtPercentile(metric, week, gender, 50),
    p97: valueAtPercentile(metric, week, gender, 97),
  };
}

export const metricConfig: Record<GrowthMetric, { label: string; unit: string; step: string }> = {
  weight: { label: 'Weight', unit: 'kg', step: '0.01' },
  length: { label: 'Length', unit: 'cm', step: '0.1'  },
  head:   { label: 'Head',   unit: 'cm', step: '0.1'  },
};
