import { useState } from 'react';
import { X, Check, Plus, Baby, Sun, Moon, Utensils, TriangleAlert } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { solidsOf } from '../../lib/solids';
import { emptySolid, hasFoods, milkOut, milkSeed, solidOut, solidSeed, withValue, type MilkKind, type MilkState, type SolidDraft } from '../../lib/foodForm';
import type { FoodEntry } from '../../types';
import { DateInput } from '../shared/DateInput';
import { WheelPicker } from '../shared/WheelPicker';
import { PoopIcon } from '../shared/PoopIcon';
import { chipCls } from '../shared/chipStyle';
import { ALLERGIES, FOODS, PORTIONS, TOP_FOODS, MAIN_FOODS, SNACK_FOODS, POOP_COLORS, POOP_TEXTURES, type PoopColor } from './foodOptions';

const TIMES = Array.from({ length: 13 }, (_, i) => i + 1);
const mlOf = (p: string) => (/^\d+ ml$/.test(p) ? parseInt(p, 10) : undefined);
const ML_STEPS = Array.from({ length: 30 }, (_, i) => (i + 1) * 10); // 10..300 ml

const inputCls = 'w-full border border-peachLight rounded-xl px-3 py-2 text-sm text-app-text bg-cream focus:outline-none focus:border-peachDark';
const sectionCls = 'rounded-xl border border-peachLight bg-cream/50 p-3 space-y-3';
const titleCls = 'flex items-center gap-1.5 text-sm font-extrabold text-app-text';
const labelCls = 'text-xs font-semibold text-textMuted block mb-1.5 uppercase tracking-wide';

interface PairProps {
  children?: React.ReactNode;
  title?: string;
  timesLabel: string; mlLabel: string;
  times: number | undefined; onTimes: (v: number | undefined) => void; timesOptions: number[];
  ml: number | undefined; onMl: (v: number | undefined) => void; mlOptions: number[];
}

// two wheels (times + ml) with short captions so labels never wrap on small screens
function WheelPair({ children, title, timesLabel, mlLabel, times, onTimes, timesOptions, ml, onMl, mlOptions }: PairProps) {
  return (
    <div>
      {title && <p className="text-xs font-extrabold text-app-text mb-1.5">{title}</p>}
      {children}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>{timesLabel}</label>
          <WheelPicker options={timesOptions} value={times} onChange={onTimes} />
        </div>
        <div>
          <label className={labelCls}>{mlLabel}</label>
          <WheelPicker options={mlOptions} value={ml} onChange={onMl} unit="ml" />
        </div>
      </div>
    </div>
  );
}

function MilkSection({ title, icon, value, onChange }: { title: string; icon: React.ReactNode; value: MilkState; onChange: (v: MilkState) => void }) {
  const { t } = useLang();
  const set = (patch: MilkState) => onChange({ ...value, ...patch });
  const { kind } = value;
  const timesLabel = t('fd.timesLabel');
  const mlLabel = t('fd.mlLabel');
  return (
    <section className={sectionCls}>
      <h3 className={titleCls}>{icon}{title}</h3>
      <div className="flex gap-2">
        {([['mom', t('fd.momMilk')], ['formula', t('fd.formula')], ['mix', t('fd.mix')]] as [MilkKind, string][]).map(([k, label]) => (
          <Chip key={k} on={kind === k} onClick={() => set({ kind: kind === k ? undefined : k })}>{label}</Chip>
        ))}
      </div>
      {(kind === 'mom' || kind === 'mix') && (
        <WheelPair
          title={kind === 'mix' ? t('fd.momMilk') : undefined}
          timesLabel={timesLabel} mlLabel={mlLabel}
          times={value.momTimes} onTimes={v => set({ momTimes: v })} timesOptions={withValue(TIMES, value.momTimes)}
          ml={value.momMl} onMl={v => set({ momMl: v })} mlOptions={withValue(ML_STEPS, value.momMl)}
        >
          <label className={labelCls}>{t('fd.givenBy')}</label>
          <div className="flex gap-2 mb-3">
            {(['breast', 'bottle'] as const).map(w => {
              const ways = value.momWays ?? [];
              const on = ways.includes(w);
              return (
                <Chip key={w} on={on} onClick={() => set({ momWays: on ? ways.filter(x => x !== w) : [...ways, w] })}>
                  {t(w === 'breast' ? 'fd.wayBreast' : 'fd.wayBottle')}
                </Chip>
              );
            })}
          </div>
        </WheelPair>
      )}
      {(kind === 'formula' || kind === 'mix') && (
        <WheelPair
          title={kind === 'mix' ? t('fd.formula') : undefined}
          timesLabel={timesLabel} mlLabel={mlLabel}
          times={value.formulaTimes} onTimes={v => set({ formulaTimes: v })} timesOptions={withValue(TIMES, value.formulaTimes)}
          ml={value.formulaMl} onMl={v => set({ formulaMl: v })} mlOptions={withValue(ML_STEPS, value.formulaMl)}
        />
      )}
    </section>
  );
}

interface BlockProps { title: string; value: SolidDraft; onChange: (v: SolidDraft) => void; onRemove?: () => void }

// one solid meal: what baby ate + how much
function SolidBlock({ title, value, onChange, onRemove }: BlockProps) {
  const { t, lang } = useLang();
  const { foods, other, portion } = value;
  const toggleFood = (f: string) => onChange({ ...value, foods: foods.includes(f) ? foods.filter(x => x !== f) : [...foods, f] });
  function addOther() {
    const f = other.trim();
    onChange({ ...value, other: '', foods: f && !foods.some(x => x.toLowerCase() === f.toLowerCase()) ? [...foods, f] : foods });
  }
  // free-text foods stay visible as selected chips, tap to remove
  // the usual quick picks, plus extras for a main meal or a snack
  const foodLabel = (f: string) => ((FOODS as readonly string[]).includes(f) ? t(`fd.food.${f}` as UiKey) : f);
  const byLabel = (a: string, b: string) => foodLabel(a).localeCompare(foodLabel(b), lang);
  const presets = [...new Set([...TOP_FOODS, ...(value.snack ? SNACK_FOODS : MAIN_FOODS)])].sort(byLabel);
  const extraFoods = foods.filter(f => !(presets as string[]).includes(f)).sort(byLabel);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={titleCls}><Utensils size={16} strokeWidth={2.5} className="text-peachDark" />{title}</h3>
        {onRemove && (
          <button type="button" aria-label="Remove" onClick={onRemove} className="p-1 rounded-full bg-warm text-textMuted hover:text-peachDark transition-colors">
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 text-xs font-bold text-app-text cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-peach/40 rounded">
        <input type="checkbox" checked={value.snack} onChange={() => onChange({ ...value, snack: !value.snack })} className="peer sr-only" />
        <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-md border-2 border-peachLight bg-white text-transparent transition-colors peer-checked:bg-peach peer-checked:border-peach peer-checked:text-white">
          <Check size={14} strokeWidth={3.5} />
        </span>
        {t('fd.snackCheck')}
      </label>
      <label className={labelCls}>{t('fd.what')}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map(f => (
          <Chip key={f} on={foods.includes(f)} onClick={() => toggleFood(f)}>{t(`fd.food.${f}` as UiKey)}</Chip>
        ))}
        {extraFoods.map(f => (
          <Chip key={f} on onClick={() => toggleFood(f)}>{foodLabel(f)}</Chip>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('fd.phFood')}
          value={other}
          onChange={e => onChange({ ...value, other: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOther(); } }}
          className={inputCls}
        />
        <button
          type="button"
          aria-label={t('fd.phFood')}
          onClick={addOther}
          disabled={!other.trim()}
          className="flex-shrink-0 px-3 rounded-xl bg-peach text-white disabled:opacity-40 transition-opacity"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
      {hasFoods(value) && (
        <div>
          <label className={labelCls}>{t('fd.mlMealLabel')}</label>
          {/* older entries saved a chip key or grams: keep it visible until a new ml is picked */}
          {portion && mlOf(portion) === undefined && (
            <p className="text-xs text-textMuted mb-1.5">
              {t('fd.oldPortion', { p: (PORTIONS as readonly string[]).includes(portion) ? t(`fd.portion.${portion}` as UiKey) : portion })}
            </p>
          )}
          <WheelPicker
            options={withValue(ML_STEPS, mlOf(portion))}
            value={mlOf(portion)}
            onChange={v => onChange({ ...value, portion: v === undefined ? '' : `${v} ml` })}
            unit="ml"
          />
        </div>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${chipCls(on)}`}
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
  const [day, setDay] = useState(() => milkSeed(seed));
  const [night, setNight] = useState(() => milkSeed(seed?.night));
  const [meals, setMeals] = useState<SolidDraft[]>(() => {
    const m = seed ? solidsOf(seed).map(solidSeed) : [];
    return m.length ? m : [emptySolid()];
  });
  // like reactions, poop is never prefilled from the last day
  const [pTimes, setPTimes] = useState<number | undefined>(initialEntry?.poop?.times);
  const [pColors, setPColors] = useState<string[]>(initialEntry?.poop?.colors ?? []);
  const [pTextures, setPTextures] = useState<string[]>(initialEntry?.poop?.textures ?? []);
  const hasPoop = pTimes !== undefined || pColors.length > 0 || pTextures.length > 0;
  const toggleIn = (set: (f: (p: string[]) => string[]) => void, v: string) => set(p => (p.includes(v) ? p.filter(x => x !== v) : [...p, v]));
  // never prefilled from the last day: a reaction belongs to that day only
  const [allergy, setAllergy] = useState<string[]>(initialEntry?.allergy ?? []);
  const [otherAllergy, setOtherAllergy] = useState('');

  const solids = meals.filter(hasFoods).map(solidOut);
  const dayOut = milkOut(day);
  const nightOut = milkOut(night);
  const hasMilk = Object.keys(dayOut).length > 0 || Object.keys(nightOut).length > 0;
  const canSave = date && (hasMilk || solids.length > 0 || hasPoop || allergy.length > 0 || otherAllergy.trim() !== '');

  function handleSave() {
    if (!canSave) return;
    const allAllergy = [...allergy, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])];
    onSave({
      id: date,
      date,
      ...dayOut,
      ...(Object.keys(nightOut).length ? { night: nightOut } : {}),
      ...(hasPoop ? { poop: { ...(pTimes !== undefined ? { times: pTimes } : {}), ...(pColors.length ? { colors: pColors } : {}), ...(pTextures.length ? { textures: pTextures } : {}) } } : {}),
      ...(allAllergy.length ? { allergy: allAllergy } : {}),
      ...(solids.length ? { solids } : {}),
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

        <MilkSection title={t('fd.milkDay')} icon={<Sun size={16} strokeWidth={2.5} className="text-peachDark" />} value={day} onChange={setDay} />
        <MilkSection title={t('fd.milkNight')} icon={<Moon size={16} strokeWidth={2.5} className="text-peachDark" />} value={night} onChange={setNight} />

        {meals.map((m, i) => (
          <section key={i} className={sectionCls}>
            <SolidBlock
              title={m.snack ? t('fd.snack') : meals.filter(x => !x.snack).length > 1 ? t('fd.solidN', { n: meals.slice(0, i).filter(x => !x.snack).length + 1 }) : t('fd.solid')}
              value={m}
              onChange={v => setMeals(p => p.map((x, j) => (j === i ? v : x)))}
              onRemove={meals.length > 1 ? () => setMeals(p => p.filter((_, j) => j !== i)) : undefined}
            />
          </section>
        ))}
        {hasFoods(meals[meals.length - 1]) && (
          <button
            type="button"
            onClick={() => setMeals(p => [...p, emptySolid()])}
            className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border border-dashed border-peach text-xs font-bold text-peachDark"
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('fd.addSolid')}
          </button>
        )}

        <section className={sectionCls}>
          <h3 className={titleCls}><Baby size={16} strokeWidth={2.5} className="text-peachDark" />{t('fd.poop')}</h3>
          <div>
            <label className={labelCls}>{t('fd.timesLabel')}</label>
            <WheelPicker options={withValue(TIMES, pTimes)} value={pTimes} onChange={setPTimes} />
          </div>
          <div>
            <label className={labelCls}>{t('fd.poopColor')}</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(POOP_COLORS) as PoopColor[]).map(c => (
                <Chip key={c} on={pColors.includes(c)} onClick={() => toggleIn(setPColors, c)}>
                  <PoopIcon color={POOP_COLORS[c]} size={18} />
                  {t(`fd.poopColor.${c}` as UiKey)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('fd.poopTexture')}</label>
            <div className="flex flex-wrap gap-2">
              {POOP_TEXTURES.map(x => (
                <Chip key={x} on={pTextures.includes(x)} onClick={() => toggleIn(setPTextures, x)}>{t(`fd.poopTexture.${x}` as UiKey)}</Chip>
              ))}
            </div>
          </div>
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
