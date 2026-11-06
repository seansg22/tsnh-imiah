import { useState } from 'react';
import { X, Plus, Baby, Sun, Moon, Utensils, TriangleAlert, Sparkles, Cookie } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { useApp } from '../../context/appStateContext';
import { solidsOf } from '../../lib/solids';
import { milkSum, milkSumAll } from '../../lib/milkTotal';
import { dayMilksOf, splitDayMilks } from '../../lib/dayMilks';
import { emptySolid, hasFoods, milkOut, milkSeed, newMilkRecord, solidOut, solidSeed, withValue, type MilkKind, type MilkState, type SolidDraft } from '../../lib/foodForm';
import type { FoodEntry } from '../../types';
import { DateInput } from '../shared/DateInput';
import { WheelPicker } from '../shared/WheelPicker';
import { PoopIcon } from '../shared/PoopIcon';
import { Chip } from '../shared/Chip';
import { AutoTextarea } from '../shared/AutoTextarea';
import { FullPageForm } from '../shared/FullPageForm';
import { ALLERGIES, FOODS, PORTIONS, TOP_FOODS, MAIN_FOODS, SNACK_FOODS, POOP_COLORS, POOP_TEXTURES, type PoopColor } from './foodOptions';
import { cardShadow, smallInputCls } from '../shared/cardStyle';

const TIMES = Array.from({ length: 13 }, (_, i) => i + 1);
const ML_STEPS = Array.from({ length: 30 }, (_, i) => (i + 1) * 10); // 10..300 ml

const sectionCls = `rounded-2xl bg-white p-4 space-y-3 ${cardShadow}`;
const titleCls = 'flex items-center gap-1.5 text-sm font-extrabold text-app-text';
const labelCls = 'text-sm font-semibold text-textMuted block mb-1.5';

interface AmountProps {
  children?: React.ReactNode;
  title?: string;
  label: string;
  ml: number | undefined; onMl: (v: number | undefined) => void; mlOptions: number[];
}

// one ml wheel, with an optional title and extra controls above it
function AmountWheel({ children, title, label, ml, onMl, mlOptions }: AmountProps) {
  return (
    <div>
      {title && <p className="text-sm font-extrabold text-app-text mb-1.5">{title}</p>}
      {children}
      <label className={labelCls}>{label}</label>
      <WheelPicker options={mlOptions} value={ml} onChange={onMl} unit="ml" />
    </div>
  );
}

function MilkSection({ title, icon, value, onChange, onRemove }: { title: string; icon: React.ReactNode; value: MilkState; onChange: (v: MilkState) => void; onRemove?: () => void }) {
  const { t } = useLang();
  const set = (patch: MilkState) => onChange({ ...value, ...patch });
  const { kind } = value;
  const mlLabel = t('fd.mlLabel');
  const total = milkSum(milkOut(value)); // only what the chosen kind will save
  return (
    <section className={sectionCls}>
      <div className="flex items-center justify-between">
        <h3 className={titleCls}>{icon}{title}</h3>
        {onRemove && (
          <button type="button" aria-label="Remove" onClick={onRemove} className="p-1 rounded-full bg-warm text-textMuted hover:text-peachDark transition-colors">
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {([['mom', t('fd.momMilk')], ['formula', t('fd.formula')], ['mix', t('fd.mix')]] as [MilkKind, string][]).map(([k, label]) => (
          <Chip key={k} on={kind === k} onClick={() => set({ kind: kind === k ? undefined : k })}>{label}</Chip>
        ))}
      </div>
      {(kind === 'mom' || kind === 'mix') && (
        <AmountWheel
          title={kind === 'mix' ? t('fd.momMilk') : undefined}
          label={mlLabel}
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
        </AmountWheel>
      )}
      {(kind === 'formula' || kind === 'mix') && (
        <AmountWheel
          title={kind === 'mix' ? t('fd.formula') : undefined}
          label={mlLabel}
          ml={value.formulaMl} onMl={v => set({ formulaMl: v })} mlOptions={withValue(ML_STEPS, value.formulaMl)}
        />
      )}
      {kind === 'mix' && total.ml > 0 && ( // one wheel: the total is just that number
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-bold text-app-text">{t('fd.totalAll')}</span>
          <span className="font-extrabold text-peachDark">{total.ml}{total.complete ? '' : '+'} ml</span>
        </div>
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
  // same quick picks for a main meal and a snack
  const foodLabel = (f: string) => ((FOODS as readonly string[]).includes(f) ? t(`fd.food.${f}` as UiKey) : f);
  const byLabel = (a: string, b: string) => foodLabel(a).localeCompare(foodLabel(b), lang);
  const presets = [...new Set([...TOP_FOODS, ...MAIN_FOODS, ...SNACK_FOODS])].sort(byLabel);
  const extraFoods = foods.filter(f => !(presets as string[]).includes(f)).sort(byLabel);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className={titleCls}><Utensils size={16} strokeWidth={2.5} className="text-peachDark" />{title}</h3>
          {/* snack switch in the header: label + a real sliding knob so it reads as a toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={value.snack}
            aria-label={t('fd.snackCheck')}
            onClick={() => onChange({ ...value, snack: !value.snack })}
            className={`flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full border-2 border-warm bg-white text-xs font-bold transition-colors active:scale-95 ${value.snack ? 'text-peachDark' : 'text-textMuted'}`}
          >
            <Cookie size={14} strokeWidth={2.5} />
            {t('fd.snack')}
            <span className={`relative h-5 w-9 rounded-full transition-colors ${value.snack ? 'bg-peach' : 'bg-warm'}`}>
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value.snack ? 'translate-x-4' : ''}`} />
            </span>
          </button>
        </div>
        {onRemove && (
          <button type="button" aria-label="Remove" onClick={onRemove} className="flex-shrink-0 p-1 rounded-full bg-warm text-textMuted hover:text-peachDark transition-colors">
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <label className={labelCls}>{t('fd.what')}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map(f => (
          <Chip key={f} on={foods.includes(f)} onClick={() => toggleFood(f)}>{t(`fd.food.${f}` as UiKey)}</Chip>
        ))}
      </div>
      {extraFoods.length > 0 && ( // typed foods: own row right under the presets, dashed + sparkle + X mark them as custom
        <div className="flex flex-wrap gap-2">
        {extraFoods.map(f => (
          <span
            key={f}
            className="flex max-w-full items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border-2 border-dashed border-peachDark bg-gradient-to-r from-peachLight to-white text-xs font-bold text-peachDark [overflow-wrap:anywhere]"
          >
            <Sparkles size={12} strokeWidth={2.5} className="flex-shrink-0" />
            {f}
            <button
              type="button"
              aria-label={`${t('fd.removeCustom')} ${f}`}
              onClick={() => toggleFood(f)}
              className="flex-shrink-0 p-0.5 rounded-full hover:bg-peachDark/20 active:scale-90 transition"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('fd.phFood')}
          value={other}
          onChange={e => onChange({ ...value, other: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOther(); } }}
          className={smallInputCls}
        />
        <button
          type="button"
          aria-label={t('fd.phFood')}
          onClick={addOther}
          disabled={!other.trim()}
          className="flex-shrink-0 px-3 rounded-lg bg-peach text-white disabled:opacity-40 transition-opacity"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
      {hasFoods(value) && (
        <div>
          <label className={labelCls}>{t('fd.mlMealLabel')}</label>
          {/* free text; an older chip key shows as its label, and stays saved as is until typed over */}
          <AutoTextarea
            placeholder={t('fd.phPortion')}
            value={(PORTIONS as readonly string[]).includes(portion) ? t(`fd.portion.${portion}` as UiKey) : portion}
            onChange={v => onChange({ ...value, portion: v })}
            className={smallInputCls}
          />
        </div>
      )}
    </div>
  );
}

interface Props {
  onSave: (entry: FoodEntry) => void;
  onCancel: () => void;
  initialEntry?: FoodEntry;
}

export function FoodDiaryForm({ onSave, onCancel, initialEntry }: Props) {
  const seed = initialEntry; // adding starts blank
  const { t } = useLang();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialEntry?.date ?? today);
  // daytime milk can have several records; the first one is saved on the entry itself, see dayMilksOf
  const [days, setDays] = useState<MilkState[]>(() => {
    const list = seed ? dayMilksOf(seed).map(milkSeed) : [];
    return list.length ? list : [milkSeed(seed ? {} : undefined)];
  });
  const [night, setNight] = useState(() => milkSeed(seed?.night));
  const [meals, setMeals] = useState<SolidDraft[]>(() => {
    const m = seed ? solidsOf(seed).map(solidSeed) : [];
    return m.length ? m : [emptySolid()];
  });
  const [pTimes, setPTimes] = useState<number | undefined>(initialEntry?.poop?.times);
  const [pColors, setPColors] = useState<string[]>(initialEntry?.poop?.colors ?? []);
  const [pTextures, setPTextures] = useState<string[]>(initialEntry?.poop?.textures ?? []);
  const hasPoop = pTimes !== undefined || pColors.length > 0 || pTextures.length > 0;
  const toggleIn = (set: (f: (p: string[]) => string[]) => void, v: string) => set(p => (p.includes(v) ? p.filter(x => x !== v) : [...p, v]));
  // ready-made reactions are tags, anything typed before is one free text box
  const isTag = (a: string) => (ALLERGIES as readonly string[]).includes(a);
  const [allergy, setAllergy] = useState<string[]>((initialEntry?.allergy ?? []).filter(isTag));
  const [otherAllergy, setOtherAllergy] = useState((initialEntry?.allergy ?? []).filter(a => !isTag(a)).join(', '));

  const solids = meals.filter(hasFoods).map(solidOut);
  const dayOuts = days.map(milkOut).filter(m => Object.keys(m).length > 0);
  const dayTotal = milkSumAll(dayOuts);
  const nightOut = milkOut(night);
  const hasMilk = dayOuts.length > 0 || Object.keys(nightOut).length > 0;
  // one note per day (the id is the date), so a second one would silently replace the first
  const { state } = useApp();
  const dateTaken = state.foodEntries.some(e => e.date === date && e.id !== initialEntry?.id);
  const canSave = date && !dateTaken && (hasMilk || solids.length > 0 || hasPoop || allergy.length > 0 || otherAllergy.trim() !== '');

  function handleSave() {
    if (!canSave) return;
    const allAllergy = [...allergy, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])];
    onSave({
      id: date,
      date,
      ...splitDayMilks(dayOuts),
      ...(Object.keys(nightOut).length ? { night: nightOut } : {}),
      ...(hasPoop ? { poop: { ...(pTimes !== undefined ? { times: pTimes } : {}), ...(pColors.length ? { colors: pColors } : {}), ...(pTextures.length ? { textures: pTextures } : {}) } } : {}),
      ...(allAllergy.length ? { allergy: allAllergy } : {}),
      ...(solids.length ? { solids } : {}),
    });
  }

  const footer = (
    <>
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full py-2.5 rounded-xl text-sm font-bold bg-peach text-white disabled:bg-[#FBD1B4] disabled:shadow-none"
      >
        {initialEntry ? t('fd.update') : t('fd.save')}
      </button>
    </>
  );

  return (
    <FullPageForm title={initialEntry ? t('fd.edit') : t('fd.add')} onClose={onCancel} footer={footer}>
        <div>
          <label className={labelCls}>{t('fd.date')}</label>
          <DateInput compact value={date} max={today} onChange={setDate} />
          {dateTaken && <p className="mt-1.5 text-sm font-semibold text-red-500">{t('fd.dateTaken')}</p>}
        </div>

        {days.map((d, i) => (
          <MilkSection
            key={i}
            title={days.length > 1 ? t('fd.milkDayN', { n: i + 1 }) : t('fd.milkDay')}
            icon={<Sun size={16} strokeWidth={2.5} className="text-peachDark" />}
            value={d}
            onChange={v => setDays(p => p.map((x, j) => (j === i ? v : x)))}
            onRemove={days.length > 1 ? () => setDays(p => p.filter((_, j) => j !== i)) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={() => setDays(p => [...p, newMilkRecord()])}
          className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border border-dashed border-peach bg-white/60 text-xs font-bold text-peachDark"
        >
          <Plus size={14} strokeWidth={2.5} />
          {t('fd.addMilk')}
        </button>
        {days.length > 1 && dayTotal.ml > 0 && (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-bold text-app-text">{t('fd.dayTotal')}</span>
            <span className="font-extrabold text-peachDark">{dayTotal.ml}{dayTotal.complete ? '' : '+'} ml</span>
          </div>
        )}
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
        <button
          type="button"
          onClick={() => setMeals(p => [...p, emptySolid()])}
          className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border border-dashed border-peach bg-white/60 text-xs font-bold text-peachDark"
        >
          <Plus size={14} strokeWidth={2.5} />
          {t('fd.addSolid')}
        </button>

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
          </div>
          <AutoTextarea placeholder={t('fd.phAllergy')} value={otherAllergy} onChange={setOtherAllergy} className={smallInputCls} />
        </section>

    </FullPageForm>
  );
}
