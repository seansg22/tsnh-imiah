import { useState } from 'react';
import { Baby, Cake } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { TextInput } from '../../components/shared/TextInput';
import { DateInput } from '../../components/shared/DateInput';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';

export function OnboardingScreen() {
  const { dispatch } = useApp();
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const minDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  function handleFinish() {
    if (!name.trim() || !birthDate) return;
    dispatch({ type: 'SET_BABY_PROFILE', payload: { name: name.trim(), birthDate, gender: 'girl' } });
    dispatch({ type: 'SET_PAGE', payload: 'today' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-peachLight to-cream flex flex-col items-center justify-center px-6">
      {step === 1 ? (
        <div className="w-full max-w-sm fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
              <Baby size={40} strokeWidth={1.5} className="text-peachDark" />
            </div>
            <h1 className="text-3xl font-extrabold text-app-text">IMIAH</h1>
            <p className="text-textMuted mt-2 font-medium">{t('onb.tagline')}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg font-bold text-app-text mb-4">{t('onb.nameQ')}</p>
            <TextInput
              value={name}
              onChange={setName}
              placeholder={t('onb.namePh')}
            />
            <Button
              className="w-full mt-4"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              {t('onb.next')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
              <Cake size={40} strokeWidth={1.5} className="text-peachDark" />
            </div>
            <h1 className="text-2xl font-extrabold text-app-text">{t('onb.bornQ', { name })}</h1>
            <p className="text-textMuted mt-2 font-medium text-sm">{t('onb.bornHint')}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <DateInput
              value={birthDate}
              max={today}
              min={minDate}
              onChange={setBirthDate}
            />
            <Button
              className="w-full mt-4"
              disabled={!birthDate}
              onClick={handleFinish}
            >
              {t('onb.start')}
            </Button>
            <button
              onClick={() => setStep(1)}
              className="w-full mt-2 text-textMuted text-sm font-semibold py-2"
            >
              {t('onb.back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
