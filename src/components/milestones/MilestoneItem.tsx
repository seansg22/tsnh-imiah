import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, AlertCircle, SkipForward, Undo2 } from 'lucide-react';
import { useLang, type LangState } from '../../i18n/langContext';
import type { Milestone } from '../../types';

type T = LangState['t'];

function fmtWeek(w: number, t: T): string {
  if (w <= 52) return t('wk.week', { n: w });
  const yrs = Math.floor(w / 52);
  const wks = w % 52;
  return wks === 0 ? t('wk.shortYear', { n: yrs }) : t('wk.shortYearWeek', { y: yrs, w: wks });
}

function fmtWeekRange(start: number, end: number, t: T): string {
  if (start <= 52) return t('wk.range', { s: start, e: end });
  return `${fmtWeek(start, t)} – ${fmtWeek(end, t)}`;
}

interface MilestoneItemProps {
  milestone: Milestone;
  achieved: boolean;
  overdue?: boolean;
  skipped?: boolean;
  onSkip?: () => void; // only given for milestones that can be skipped (vaccinations)
  onToggle: () => void;
}

export function MilestoneItem({ milestone, achieved, overdue, skipped, onSkip, onToggle }: MilestoneItemProps) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const hasDescription = !!milestone.description;

  return (
    <div className={`rounded-xl overflow-hidden transition-all ${achieved ? 'bg-green-50 opacity-80 border border-green-200' : skipped ? 'bg-gray-50 opacity-70 border border-gray-200' : overdue ? 'bg-amber-50/60 border border-orange-300' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={onToggle}
          disabled={skipped} // undo the skip first, then it can be checked
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
            achieved ? 'bg-success border-success' : skipped ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : overdue ? 'border-orange-300' : 'border-peachLight'
          }`}
        >
          {achieved && <Check size={14} strokeWidth={3} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${achieved ? 'text-textMuted line-through' : 'text-app-text'}`}>
            {milestone.label}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="text-xs text-textMuted">
              {fmtWeekRange(milestone.weekRange[0], milestone.weekRange[1], t)}
            </span>
            {skipped && !achieved && <span className="text-xs text-textMuted font-semibold">{t('ms.skipped')}</span>}
            {overdue && <span className="text-xs text-orange-400 font-semibold flex items-center gap-0.5"><AlertCircle size={11} /> {t('ms.overdue')}</span>}
          </div>
          {onSkip && !achieved && (
            <button
              onClick={onSkip}
              className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold transition-colors active:scale-95 ${
                skipped ? 'border-gray-300 bg-white text-textMuted' : 'border-peach bg-peachLight/50 text-peachDark'
              }`}
            >
              {skipped ? <Undo2 size={11} strokeWidth={2.5} /> : <SkipForward size={11} strokeWidth={2.5} />}
              {skipped ? t('ms.unskip') : t('ms.skip')}
            </button>
          )}
        </div>
        {hasDescription && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex-shrink-0 p-1 text-textMuted"
          >
            {expanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
          </button>
        )}
      </div>
      {expanded && milestone.description && (
        <div className="px-3 pb-3">
          <p className="text-xs text-textMuted leading-relaxed pl-9">{milestone.description}</p>
        </div>
      )}
    </div>
  );
}
