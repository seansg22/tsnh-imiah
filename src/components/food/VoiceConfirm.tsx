import { Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { parseISO } from 'date-fns';
import { Sun, Moon, Utensils, Baby, TriangleAlert, Mic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { formatDate } from '../../i18n/date';
import { dayMilksOf } from '../../lib/dayMilks';
import { foldTimes } from '../../lib/foodForm';
import { solidsOf } from '../../lib/solids';
import type { FoodEntry, MilkFields } from '../../types';
import { ALLERGIES, FOODS, PORTIONS, POOP_COLORS, POOP_TEXTURES } from './foodOptions';

interface Props {
  old?: FoodEntry; // the day as saved now, none = a new day
  merged: FoodEntry; // the day as it will be saved
  said: string; // what the speech-to-text heard
  del?: boolean; // the whole day will be deleted
  onRetry: () => void; // close this and record again
  onConfirm: () => void;
  onCancel: () => void;
}

type Tag = 'add' | 'upd' | 'del';
interface Item { text: string; tag?: Tag; was?: string }

// Compare the records of one part of the day, before and after.
// Same text = untouched. Left over on both sides = updated. Only after = added. Only before = deleted.
function diff(before: string[], after: string[]): Item[] {
  const gone = [...before];
  const same = after.map(x => {
    const i = gone.indexOf(x);
    if (i >= 0) gone.splice(i, 1);
    return i >= 0;
  });
  const items = after.map((text, i): Item => (same[i] ? { text } : gone.length ? { text, tag: 'upd', was: gone.shift() } : { text, tag: 'add' }));
  return [...items, ...gone.map((text): Item => ({ text, tag: 'del' }))];
}

const TAG_CLS: Record<Tag, string> = {
  add: 'bg-peach text-white',
  upd: 'bg-amber-100 text-amber-700',
  del: 'bg-red-100 text-red-500',
};
const TAG_KEY: Record<Tag, UiKey> = { add: 'voice.tagAdd', upd: 'voice.tagUpdate', del: 'voice.tagRemove' };

// "this is what will change", drawn like a history card. Nothing is saved until Confirm.
export function VoiceConfirm({ old, merged, said, del, onRetry, onConfirm, onCancel }: Props) {
  const { t, lang } = useLang();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onCancel]);

  const label = (list: readonly string[], prefix: string) => (x: string) => (list.includes(x) ? t(`${prefix}.${x}` as UiKey) : x);
  const food = label(FOODS, 'fd.food');
  const portion = label(PORTIONS, 'fd.portion');
  const allergy = label(ALLERGIES, 'fd.allergy');
  const color = label(Object.keys(POOP_COLORS), 'fd.poopColor');
  const texture = label(POOP_TEXTURES, 'fd.poopTexture');
  const dot = (parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' · ');

  const milk = (raw?: MilkFields) => {
    const m = raw && foldTimes(raw);
    const ways = (m?.momWays ?? []).map(w => t(w === 'breast' ? 'fd.wayBreast' : 'fd.wayBottle'));
    return [
      m && (m.momMl !== undefined || m.momTimes !== undefined || ways.length > 0) && dot([t('fd.momMilk'), m.momTimes !== undefined && `${m.momTimes}×`, m.momMl !== undefined && `${m.momMl} ml`, ...ways]),
      m && (m.formulaMl !== undefined || m.formulaTimes !== undefined) && dot([t('fd.formula'), m.formulaTimes !== undefined && `${m.formulaTimes}×`, m.formulaMl !== undefined && `${m.formulaMl} ml`]),
    ].filter(Boolean).join(', ');
  };

  // one list of texts per part of the day, same order as the history card
  const lists = (e?: FoodEntry) => ({
    day: e ? dayMilksOf(e).map(milk).filter(Boolean) : [],
    night: e?.night ? [milk(e.night)].filter(Boolean) : [],
    solids: e ? solidsOf(e).map(s => dot([s.foods.map(food).join(', '), s.portion && portion(s.portion), s.snack && t('fd.snack')])) : [],
    poop: e?.poop ? [dot([e.poop.times !== undefined && `${e.poop.times}×`, e.poop.colors?.map(color).join(', '), e.poop.textures?.map(texture).join(', '), e.poop.note])].filter(Boolean) : [],
    allergy: (e?.allergy ?? []).map(allergy),
  });
  const b = lists(old);
  const a = lists(merged);
  const groups: { Icon: LucideIcon; label: string; items: Item[]; red?: boolean }[] = [
    { Icon: Sun, label: t('fd.milkDay'), items: diff(b.day, a.day) },
    { Icon: Moon, label: t('fd.milkNight'), items: diff(b.night, a.night) },
    { Icon: Utensils, label: t('fd.solid'), items: diff(b.solids, a.solids) },
    { Icon: Baby, label: t('fd.poop'), items: diff(b.poop, a.poop) },
    { Icon: TriangleAlert, label: t('fd.allergy'), items: diff(b.allergy, a.allergy), red: true },
  ].filter(g => g.items.length > 0);
  const date = formatDate(parseISO(merged.date), 'dd MMM yyyy', lang);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6" onClick={onCancel}>
      <div role="dialog" aria-modal="true" className="w-full max-w-[360px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="text-base font-extrabold text-app-text">{t('voice.confirmTitle')}</p>
        <p className="mt-2 text-sm text-textMuted italic [overflow-wrap:anywhere]">{t('voice.said')}: "{said}"</p>
        <p className="mt-3 text-sm font-bold text-peachDark">{t(del ? 'voice.delDay' : old ? 'voice.oldDay' : 'voice.newDay', { date })}</p>
        {/* same grid as the history card: icon | label | content */}
        <div className="mt-3 grid grid-cols-[14px_max-content_minmax(0,1fr)] items-baseline gap-x-2 gap-y-2 rounded-2xl bg-peachLight/50 p-3">
          {groups.flatMap(g => g.items.map((it, i) => ({ g, it, first: i === 0 }))).map(({ g, it, first }, i) => (
            <Fragment key={i}>
              <span className="self-start">{first && <g.Icon size={14} strokeWidth={2.5} className={`mt-0.5 ${g.red ? 'text-red-500' : 'text-peachDark'}`} />}</span>
              <span className={`self-start text-xs font-bold ${g.red ? 'text-red-500' : 'text-peachDark'}`}>{first ? g.label : ''}</span>
              <div className="text-sm leading-snug [overflow-wrap:anywhere]">
                <span className={`font-semibold ${it.tag === 'del' ? 'text-textMuted line-through' : g.red ? 'text-red-500' : 'text-app-text'}`}>{it.text}</span>
                {it.tag && <span className={`ml-2 rounded-full px-2 py-0.5 align-middle text-xs font-bold ${TAG_CLS[it.tag]}`}>{t(TAG_KEY[it.tag])}</span>}
                {it.was && <p className="text-textMuted line-through">{it.was}</p>}
              </div>
            </Fragment>
          ))}
        </div>
        <button onClick={onRetry} className="mt-4 flex w-full items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-peach/60 text-sm font-bold text-peachDark active:bg-cream">
          <Mic size={14} strokeWidth={2.5} />
          {t('voice.retry')}
        </button>
        <div className="mt-2 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">{t('confirm.cancel')}</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:opacity-80 ${del ? 'bg-red-500' : 'bg-peach'}`}>{t('voice.confirm')}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
