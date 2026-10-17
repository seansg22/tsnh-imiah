import { useState } from 'react';
import { Milk, Moon, HandHeart, ShieldCheck, Heart } from 'lucide-react';
import type { CareTips } from '../../types';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';

type Tab = 'feeding' | 'sleep' | 'soothing' | 'health';

interface CareTipsSectionProps {
  tips: CareTips;
  soothingLabel: string;
  parentTip?: string;
}

const tabConfig: {
  key: Tab;
  label: UiKey | null;
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  color: string;
  activeBg: string;
}[] = [
  { key: 'feeding',  label: 'careTips.feeding', Icon: Milk,        color: 'text-blue-400',   activeBg: 'bg-blue-50 border-blue-200'     },
  { key: 'sleep',    label: 'careTips.sleep',  Icon: Moon,        color: 'text-indigo-400', activeBg: 'bg-indigo-50 border-indigo-200' },
  { key: 'soothing', label: null,  Icon: HandHeart,   color: 'text-peachDark',  activeBg: 'bg-peachLight border-peachLight'},
  { key: 'health',   label: 'careTips.health',  Icon: ShieldCheck, color: 'text-green-500',  activeBg: 'bg-green-50 border-green-200'   },
];

export function CareTipsSection({ tips, soothingLabel, parentTip }: CareTipsSectionProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('feeding');

  const active = tabConfig.find(t => t.key === activeTab)!;
  const items = tips[activeTab];

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center gap-2">
        <Heart size={16} strokeWidth={2} className="text-peachDark" />
        <p className="text-base font-extrabold text-app-text">{t('careTips.title')}</p>
      </div>

      <div className="mt-4">
        {/* Tabs: one row, icon above label */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {tabConfig.map(({ key, label, Icon, color, activeBg }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                activeTab === key
                  ? activeBg
                  : 'bg-warm border-transparent text-textMuted'
              }`}
            >
              <Icon size={16} strokeWidth={2} className={activeTab === key ? color : 'text-textMuted'} />
              <span className={`max-w-full truncate ${activeTab === key ? 'text-app-text' : ''}`}>{label ? t(label) : soothingLabel}</span>
            </button>
          ))}
        </div>

        {/* Tips: one card, divided list */}
        <ul className="bg-white rounded-xl shadow-sm divide-y divide-warm">
          {items.map((tip, i) => (
            <li key={i} className="flex gap-2.5 items-start px-3 py-2.5">
              <span className={`${active.color} mt-[7px] w-1.5 h-1.5 rounded-full bg-current flex-shrink-0`} />
              <p className="text-sm text-app-text leading-snug">{tip}</p>
            </li>
          ))}
        </ul>

        {/* Parent tip */}
        {parentTip && (
          <div className="mt-4 bg-orange-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart size={13} strokeWidth={2} className="text-peachDark" />
              <p className="text-xs font-bold uppercase tracking-wide text-peachDark">{t('careTips.tip')}</p>
            </div>
            <p className="text-sm text-app-text leading-relaxed">{parentTip}</p>
          </div>
        )}
      </div>
    </section>
  );
}
