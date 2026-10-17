import { useState } from 'react';
import { X, Milk, Utensils, TriangleAlert } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import type { FoodEntry } from '../../types';
import { DateInput } from '../shared/DateInput';
import { WheelPicker } from '../shared/WheelPicker';
import { ALLERGIES, FOODS, TOP_FOODS, PORTIONS } from './foodOptions';

const TIMES = Array.from({ length: 13 }, (_, i) => i + 1);
const GRAMS = Array.from({ length: 20 }, (_, i) => (i + 1) * 10); // 10..200 g
const gramsOf = (p: string) => (/^\d+ g$/.test(p) ? parseInt(p, 10) : undefined);
const ML_STEPS = Array.from({ length: 30 }, (_, i) => (i + 1) * 10); // 10..300 ml

const inputCls = 'w-full border border-peachLight rounded-xl px-3 py-2 text-sm text-app-text bg-cream focus:outline-none focus:border-peachDark';
const sectionCls = 'rounded-xl border border-peachLight bg-cream/50 p-3 space-y-3';
const titleCls = 'flex items-center gap-1.5 text-sm font-extrabold text-app-text';
const labelCls = 'text-xs font-semibold text-textMuted block mb-1.5 uppercase tracking-wide';

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${on ? 'bg-peach text-white' : 'bg-warm text-textMuted'}`}
    >
      {children}
    </button>
  );
}

interface Props {
  onSave: (entry: FoodEntry) => void;
  onCancel: () => void;
  initialEntry?: FoodEntry;
  prefill?: FoodEntry; // when adding: start from the most recent day's values (date stays today)
}

export function FoodDiaryForm({ onSave, onCancel, initialEntry, prefill }: Props) {
  const seed = initialEntry ?? prefill;
  const { t } = useLang();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialEntry?.date ?? today);
  const [times, setTimes] = useState(seed?.momTimes !== undefined ? String(seed.momTimes) : '');
  const [fTimes, setFTimes] = useState(seed?.formulaTimes !== undefined ? String(seed.formulaTimes) : '');
  const [ml, setMl] = useState<number | undefined>(seed?.formulaMl);
  // keep an older saved value that isn't a multiple of 10 selectable
  const mlOptions = seed?.formulaMl !== undefined && !ML_STEPS.includes(seed.formulaMl)
    ? [...ML_STEPS, seed.formulaMl].sort((x, y) => x - y)
    : ML_STEPS;
  const [foods, setFoods] = useState<string[]>(seed?.foods ?? []);
  const [otherFood, setOtherFood] = useState('');
  const [sTimes, setSTimes] = useState(seed?.solidTimes !== undefined ? String(seed.solidTimes) : '');
  // never prefilled from the last day: a reaction belongs to that day only
  const [allergy, setAllergy] = useState<string[]>(initialEntry?.allergy ?? []);
  const [otherAllergy, setOtherAllergy] = useState('');
  const [portion, setPortion] = useState(seed?.portion ?? '');

  const hasSolid = foods.length > 0 || otherFood.trim() !== '';
  const canSave = date && (times !== '' || fTimes !== '' || ml !== undefined || hasSolid || allergy.length > 0 || otherAllergy.trim() !== '');

  const toggleFood = (f: string) => setFoods(p => (p.includes(f) ? p.filter(x => x !== f) : [...p, f]));

  // free-text foods the user typed earlier stay visible as selected chips when editing
  const extraFoods = foods.filter(f => !(TOP_FOODS as string[]).includes(f));

  // saved foods outside the top 10 stay visible (and removable) while editing
  const foodLabel = (f: string) => ((FOODS as readonly string[]).includes(f) ? t(`fd.food.${f}` as UiKey) : f);

  function handleSave() {
    if (!canSave) return;
    const allFoods = [...foods, ...(otherFood.trim() ? [otherFood.trim()] : [])];
    const allAllergy = [...allergy, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])];
    onSave({
      id: date,
      date,
      ...(times !== '' ? { momTimes: parseInt(times, 10) } : {}),
      ...(fTimes !== '' ? { formulaTimes: parseInt(fTimes, 10) } : {}),
      ...(ml !== undefined ? { formulaMl: ml } : {}),
      ...(allAllergy.length ? { allergy: allAllergy } : {}),
      ...(allFoods.length ? { foods: allFoods, ...(sTimes !== '' ? { solidTimes: parseInt(sTimes, 10) } : {}), ...(portion.trim() ? { portion: portion.trim() } : {}) } : {}),
    });
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-peachLight">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-app-text text-sm">{initialEntry ? t('fd.edit') : t('fd.add')}</p>
        <button onClick={onCancel} className="p-1 text-textMuted">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>{t('fd.date')}</label>
          <DateInput compact value={date} max={today} onChange={setDate} />
        </div>

        <section className={sectionCls}>
          <h3 className={titleCls}><Milk size={16} strokeWidth={2.5} className="text-peachDark" />{t('fd.milk')}</h3>
          <div>
          <label className={labelCls}>{t('fd.momTimes')}</label>
          <div className="flex flex-wrap gap-2">
            {TIMES.map(v => (
              <Chip key={v} on={times === String(v)} onClick={() => setTimes(times === String(v) ? '' : String(v))}>{v}</Chip>
            ))}
          </div>
          </div>

          <div>
          <label className={labelCls}>{t('fd.formulaTimes')}</label>
          <div className="flex flex-wrap gap-2">
            {TIMES.map(v => (
              <Chip key={v} on={fTimes === String(v)} onClick={() => setFTimes(fTimes === String(v) ? '' : String(v))}>{v}</Chip>
            ))}
          </div>
          </div>

          <div>
          <label className={labelCls}>{t('fd.formulaMl')}</label>
          <WheelPicker options={mlOptions} value={ml} onChange={setMl} unit="ml" />
          </div>
        </section>

        <section className={sectionCls}>
          <h3 className={titleCls}><Utensils size={16} strokeWidth={2.5} className="text-peachDark" />{t('fd.solid')}</h3>
          <div>
          <label className={labelCls}>{t('fd.what')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {TOP_FOODS.map(f => (
              <Chip key={f} on={foods.includes(f)} onClick={() => toggleFood(f)}>{t(`fd.food.${f}` as UiKey)}</Chip>
            ))}
            {extraFoods.map(f => (
              <Chip key={f} on onClick={() => toggleFood(f)}>{foodLabel(f)}</Chip>
            ))}
          </div>
          <input type="text" placeholder={t('fd.phFood')} value={otherFood} onChange={e => setOtherFood(e.target.value)} className={inputCls} />
          </div>

        {hasSolid && (
          <>
            <div>
              <label className={labelCls}>{t('fd.solidTimes')}</label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map(v => (
                  <Chip key={v} on={sTimes === String(v)} onClick={() => setSTimes(sTimes === String(v) ? '' : String(v))}>{v}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('fd.portion')}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PORTIONS.map(p => (
                  <Chip key={p} on={portion === p} onClick={() => setPortion(portion === p ? '' : p)}>{t(`fd.portion.${p}` as UiKey)}</Chip>
                ))}
              </div>
              <p className="text-xs text-textMuted text-center mb-1">{t('fd.orGrams')}</p>
              {/* remounts when a chip is picked so the wheel jumps back to "–" */}
              <WheelPicker
                key={(PORTIONS as readonly string[]).includes(portion) ? 'chip' : 'wheel'}
                options={GRAMS}
                value={gramsOf(portion)}
                onChange={g => setPortion(g === undefined ? '' : `${g} g`)}
                unit="g"
              />
            </div>
          </>
        )}
        </section>

        <section className={sectionCls}>
          <h3 className={titleCls}><TriangleAlert size={16} strokeWidth={2.5} className="text-peachDark" />{t('fd.allergy')}</h3>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map(a => (
              <Chip key={a} on={allergy.includes(a)} onClick={() => setAllergy(p => (p.includes(a) ? p.filter(x => x !== a) : [...p, a]))}>
                {t(`fd.allergy.${a}` as UiKey)}
              </Chip>
            ))}
            {allergy.filter(a => !(ALLERGIES as readonly string[]).includes(a)).map(a => (
              <Chip key={a} on onClick={() => setAllergy(p => p.filter(x => x !== a))}>{a}</Chip>
            ))}
          </div>
          <input type="text" placeholder={t('fd.phAllergy')} value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} className={inputCls} />
        </section>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-peach text-white disabled:opacity-40 transition-opacity"
        >
          {initialEntry ? t('fd.update') : t('fd.save')}
        </button>
      </div>
    </div>
  );
}
