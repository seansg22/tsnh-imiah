import { useState } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../../i18n/langContext';
import type { GrowthEntry } from '../../types';
import { DateInput } from '../shared/DateInput';

interface Props {
  onSave: (entry: GrowthEntry) => void;
  onCancel: () => void;
  initialEntry?: GrowthEntry;
}

export function GrowthEntryForm({ onSave, onCancel, initialEntry }: Props) {
  const { t } = useLang();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialEntry?.date ?? today);
  const [weight, setWeight] = useState(initialEntry?.weight !== undefined ? String(initialEntry.weight) : '');
  const [length, setLength] = useState(initialEntry?.length !== undefined ? String(initialEntry.length) : '');
  const [head, setHead] = useState(initialEntry?.head !== undefined ? String(initialEntry.head) : '');

  const canSave = date && (weight !== '' || length !== '' || head !== '');

  function handleSave() {
    if (!canSave) return;
    const entry: GrowthEntry = {
      id: initialEntry?.id ?? `${date}-${Date.now()}`,
      date,
      ...(weight !== '' ? { weight: parseFloat(weight) } : {}),
      ...(length !== '' ? { length: parseFloat(length) } : {}),
      ...(head !== ''   ? { head: parseFloat(head) }     : {}),
    };
    onSave(entry);
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-peachLight">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-app-text text-sm">
          {initialEntry ? t('growth.edit') : t('growth.add')}
        </p>
        <button onClick={onCancel} className="p-1 text-textMuted">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-textMuted block mb-1.5 uppercase tracking-wide">{t('growth.date')}</label>
          <DateInput value={date} max={today} onChange={setDate} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">{t('growth.weightKg')}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={t('growth.phWeight')}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full border border-peachLight rounded-xl px-3 py-2 text-sm text-app-text bg-cream focus:outline-none focus:border-peachDark"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">{t('growth.lengthCm')}</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder={t('growth.phLength')}
              value={length}
              onChange={e => setLength(e.target.value)}
              className="w-full border border-peachLight rounded-xl px-3 py-2 text-sm text-app-text bg-cream focus:outline-none focus:border-peachDark"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">{t('growth.headCm')}</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder={t('growth.phHead')}
              value={head}
              onChange={e => setHead(e.target.value)}
              className="w-full border border-peachLight rounded-xl px-3 py-2 text-sm text-app-text bg-cream focus:outline-none focus:border-peachDark"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-peach text-white disabled:opacity-40 transition-opacity"
        >
          {initialEntry ? t('growth.update') : t('growth.save')}
        </button>
      </div>
    </div>
  );
}
