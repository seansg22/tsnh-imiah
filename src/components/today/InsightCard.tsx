import { Dumbbell, Brain, Heart, Eye, Lightbulb } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import type { WeekData } from '../../types';

type Variant = 'motor' | 'cognitive' | 'social' | 'sensory' | 'funFact';

interface InsightCardProps {
  variant: Variant;
  data: WeekData;
}

const config: Record<Variant, {
  label: UiKey;
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  bg: string;
  iconClass: string;
  labelClass: string;
}> = {
  motor:     { label: 'cat.motor',       Icon: Dumbbell,  bg: 'bg-orange-100', iconClass: 'text-orange-500', labelClass: 'text-orange-600' },
  cognitive: { label: 'cat.cognitive',   Icon: Brain,     bg: 'bg-blue-100',   iconClass: 'text-blue-500',   labelClass: 'text-blue-600'   },
  social:    { label: 'cat.social',      Icon: Heart,     bg: 'bg-pink-100',   iconClass: 'text-pink-500',   labelClass: 'text-pink-600'   },
  sensory:   { label: 'cat.sensory',     Icon: Eye,       bg: 'bg-purple-100', iconClass: 'text-purple-500', labelClass: 'text-purple-600' },
  funFact:   { label: 'cat.funFact', Icon: Lightbulb, bg: 'bg-amber-50',  iconClass: 'text-amber-500',  labelClass: 'text-amber-600'  },
};

export function InsightCard({ variant, data }: InsightCardProps) {
  const { t } = useLang();
  const { label, Icon, bg, iconClass, labelClass } = config[variant];

  if (variant === 'funFact') {
    return (
      <div className={`flex-shrink-0 w-[220px] rounded-2xl ${bg} p-4 shadow-sm border border-amber-100`}>
        <div className="flex items-center gap-1.5 mb-3">
          <Icon size={14} strokeWidth={2} className={iconClass} />
          <p className={`text-xs font-bold uppercase tracking-wide ${labelClass}`}>{t(label)}</p>
        </div>
        <p className="text-xs text-app-text font-medium leading-relaxed">{data.funFact}</p>
      </div>
    );
  }

  const items = data[variant as 'motor' | 'cognitive' | 'social' | 'sensory'];

  return (
    <div className={`flex-shrink-0 w-[220px] rounded-2xl ${bg} p-4 shadow-sm`}>
      <div className="flex items-center gap-1.5 mb-3">
        <Icon size={14} strokeWidth={2} className={iconClass} />
        <p className={`text-xs font-bold uppercase tracking-wide ${labelClass}`}>{t(label)}</p>
      </div>
      <div className="space-y-2">
        {items.slice(0, 2).map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 opacity-50" />
            <p className="text-xs text-app-text font-medium leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
