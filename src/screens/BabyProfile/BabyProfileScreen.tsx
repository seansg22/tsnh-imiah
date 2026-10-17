import { useState, useEffect, useRef } from 'react';
import { parseISO } from 'date-fns';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';
import { TextInput } from '../../components/shared/TextInput';
import { DateInput } from '../../components/shared/DateInput';
import { DEFAULT_EDD, getFeeding, toLegacyMethod } from '../../constants/babyDefaults';
import type { FeedingWay, KnowledgeEntry, MilkType } from '../../types';

// Add or remove a value; `keepOne` stops the last one from being removed.
function toggle<T>(list: T[], value: T, keepOne = false): T[] {
  if (!list.includes(value)) return [...list, value];
  return keepOne && list.length === 1 ? list : list.filter(v => v !== value);
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-cream border-2 border-peachLight text-sm font-bold text-app-text cursor-pointer transition-colors has-[:checked]:bg-peachLight/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-peach/40">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-md border-2 border-peachLight bg-white text-transparent transition-colors peer-checked:bg-peach peer-checked:border-peach peer-checked:text-white">
        <Check size={14} strokeWidth={3.5} />
      </span>
      {label}
    </label>
  );
}

export function BabyProfileScreen() {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const [name, setName] = useState(state.babyProfile?.name ?? '');
  const [birthDate, setBirthDate] = useState(state.babyProfile?.birthDate ?? '');
  const [edd, setEdd] = useState(state.babyProfile?.edd ?? DEFAULT_EDD);
  const [solidsStartDate, setSolidsStartDate] = useState(state.babyProfile?.solidsStartDate ?? '');
  const [gender, setGender] = useState<'girl' | 'boy'>(state.babyProfile?.gender ?? 'girl');
  const initialFeeding = state.babyProfile ? getFeeding(state.babyProfile) : { milk: ['mom'] as MilkType[], ways: [] as FeedingWay[], other: '', milkNotes: '' };
  const [milkTypes, setMilkTypes] = useState<MilkType[]>(initialFeeding.milk);
  const [milkNotes, setMilkNotes] = useState(initialFeeding.milkNotes);
  const [feedingWays, setFeedingWays] = useState<FeedingWay[]>(initialFeeding.ways);
  const [feedingWayOther, setFeedingWayOther] = useState(initialFeeding.other);
  const [notes, setNotes] = useState(state.babyProfile?.notes ?? '');

  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [editingKnowledgeContent, setEditingKnowledgeContent] = useState('');

  function startEditKnowledge(entry: KnowledgeEntry) {
    setEditingKnowledgeId(entry.id);
    setEditingKnowledgeContent(entry.content);
  }

  function saveEditKnowledge(entry: KnowledgeEntry) {
    const content = editingKnowledgeContent.trim();
    if (content) {
      dispatch({ type: 'UPDATE_KNOWLEDGE_ENTRY', payload: { ...entry, content } });
    }
    setEditingKnowledgeId(null);
  }

  const today = new Date().toISOString().split('T')[0];
  const maxEddDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Auto-save the baby profile shortly after any field changes (skip the
  // initial mount so loading the saved profile doesn't trigger a save).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!name.trim() || !birthDate) return;
    const timeout = setTimeout(() => {
      dispatch({
        type: 'SET_BABY_PROFILE',
        payload: {
          name: name.trim(),
          birthDate,
          gender,
          feedingMethod: toLegacyMethod(milkTypes, feedingWays),
          milkTypes,
          milkNotes: milkTypes.length > 1 ? milkNotes : '',
          feedingWays,
          feedingWayOther,
          edd: edd || DEFAULT_EDD,
          solidsStartDate,
          notes,
        },
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [name, birthDate, edd, solidsStartDate, gender, milkTypes, milkNotes, feedingWays, feedingWayOther, notes, dispatch]);

  return (
    <div className="fade-in px-4 pt-6 pb-8">
      <h1 className="text-2xl font-extrabold text-app-text">{t('bp.title')}</h1>
      <p className="text-sm text-textMuted mt-1">{t('bp.subtitle')}</p>

      <div className="bg-white rounded-2xl p-4 shadow-sm mt-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.name')}</p>
            <TextInput value={name} onChange={setName} placeholder={t('bp.namePh')} className="h-11 py-0 text-sm" />
          </div>
          <div>
            <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.gender')}</p>
            <div className="flex gap-1.5">
              {(['girl', 'boy'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  aria-label={g === 'girl' ? t('bp.girl') : t('bp.boy')}
                  className={`w-10 h-11 flex items-center justify-center rounded-xl text-sm font-bold leading-none transition-all border-2 ${gender === g
                    ? 'bg-peach text-white border-peach'
                    : 'bg-cream text-textMuted border-peachLight'
                  }`}
                >
                  <span className="leading-none">{g === 'girl' ? '♀' : '♂'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.birthDate')}</p>
          <DateInput value={birthDate} max={today} onChange={setBirthDate} compact />
        </div>
        <div>
          <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.edd')}</p>
          <DateInput value={edd} max={maxEddDate} onChange={setEdd} compact />
          <p className="text-[11px] text-textMuted mt-1">{t('bp.eddHint')}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.milk')}</p>
          <div className="space-y-1.5">
            {([['mom', t('bp.momMilk')], ['formula', t('bp.formula')]] as [MilkType, string][]).map(([value, label]) => (
              <CheckRow
                key={value}
                label={label}
                checked={milkTypes.includes(value)}
                onChange={() => setMilkTypes(prev => toggle(prev, value, true))}
              />
            ))}
          </div>
          {milkTypes.length > 1 && (
            <textarea
              value={milkNotes}
              onChange={e => setMilkNotes(e.target.value)}
              rows={2}
              aria-label={t('bp.milkNotes')}
              placeholder={t('bp.milkNotesPh')}
              className="w-full mt-1.5 text-sm bg-cream rounded-xl px-4 py-3 resize-none text-app-text border-2 border-peachLight focus:border-peach outline-none transition-colors placeholder:text-textMuted/50"
            />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.feeding')}</p>
          <div className="space-y-1.5">
            {([['direct', t('bp.direct')], ['bottle', t('bp.bottle')]] as [FeedingWay, string][]).map(([value, label]) => (
              <CheckRow
                key={value}
                label={label}
                checked={feedingWays.includes(value)}
                onChange={() => setFeedingWays(prev => toggle(prev, value))}
              />
            ))}
            <textarea
              value={feedingWayOther}
              onChange={e => setFeedingWayOther(e.target.value)}
              rows={2}
              aria-label={t('bp.otherWay')}
              placeholder={t('bp.otherWayPh')}
              className="w-full text-sm bg-cream rounded-xl px-4 py-3 resize-none text-app-text border-2 border-peachLight focus:border-peach outline-none transition-colors placeholder:text-textMuted/50"
            />
          </div>
          <p className="text-[11px] text-textMuted mt-1">{t('bp.feedingHint')}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">{t('bp.solids')}</p>
            {solidsStartDate && (
              <button onClick={() => setSolidsStartDate('')} className="text-[11px] font-semibold text-peachDark">
                {t('bp.clear')}
              </button>
            )}
          </div>
          <DateInput value={solidsStartDate} min={birthDate} max={today} onChange={setSolidsStartDate} compact />
          <p className="text-[11px] text-textMuted mt-1">
            {t('bp.solidsHint')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-textMuted mb-1 uppercase tracking-wide">{t('bp.notes')}</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={14}
            placeholder={t('bp.notesPh')}
            className="w-full text-sm bg-cream rounded-xl px-4 py-3 resize-none text-app-text border-2 border-peachLight focus:border-peach outline-none transition-colors placeholder:text-textMuted/50"
          />
          <p className="text-[11px] text-textMuted mt-px">{t('bp.notesHint')}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wide mb-1 px-1">{t('bp.timeline')}</p>
        <p className="text-[11px] text-textMuted mb-2 px-1">
          {t('bp.timelineHint')}
        </p>
        <div className="space-y-2">
          {state.knowledgeBase.length === 0 && (
            <p className="text-sm text-textMuted px-1">{t('bp.timelineEmpty')}</p>
          )}
          {[...state.knowledgeBase]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map(entry => {
              const isEditing = editingKnowledgeId === entry.id;
              return (
                <div key={entry.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-textMuted">
                      {formatDate(parseISO(entry.createdAt), 'dd MMM yyyy, HH:mm', lang)}
                    </p>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveEditKnowledge(entry)}
                          className="p-1 text-success"
                          aria-label={t('bp.save')}
                        >
                          <Check size={14} strokeWidth={2.2} />
                        </button>
                        <button
                          onClick={() => setEditingKnowledgeId(null)}
                          className="p-1 text-textMuted"
                          aria-label={t('bp.cancel')}
                        >
                          <X size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditKnowledge(entry)}
                          className="p-1 text-textMuted hover:text-peach"
                          aria-label={t('bp.editEntry')}
                        >
                          <Pencil size={14} strokeWidth={2.2} />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_KNOWLEDGE_ENTRY', payload: entry.id })}
                          className="p-1 text-textMuted hover:text-red-400"
                          aria-label={t('bp.deleteEntry')}
                        >
                          <Trash2 size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editingKnowledgeContent}
                      onChange={e => setEditingKnowledgeContent(e.target.value)}
                      rows={4}
                      autoFocus
                      className="w-full text-sm bg-cream rounded-xl px-3 py-2 resize-none text-app-text border-2 border-peachLight focus:border-peach outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-app-text whitespace-pre-wrap">{entry.content}</p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
