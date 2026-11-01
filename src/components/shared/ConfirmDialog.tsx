import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../../i18n/langContext';

// "are you sure" popup for deleting a record
export function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useLang();

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

  // portal: a transformed ancestor (page fade-in) would otherwise trap position: fixed
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-base font-extrabold text-app-text">{t('confirm.deleteTitle')}</p>
        <p className="mt-1 text-sm text-textMuted">{t('confirm.deleteHint')}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-peachLight text-sm font-bold text-app-text active:bg-cream">
            {t('confirm.cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white active:opacity-80">
            {t('confirm.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
