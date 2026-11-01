import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  footer: React.ReactNode; // pinned at the bottom
  children: React.ReactNode; // scrolls
}

// full-page popup: header on top, body scrolls, footer (the save button) stays at the bottom
export function FullPageForm({ title, onClose, footer, children }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind must not scroll
    return () => { document.body.style.overflow = prev; };
  }, []);

  // portal: a transformed ancestor (page fade-in) would otherwise trap position: fixed
  return createPortal(
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-peachLight">
        <p className="font-bold text-app-text text-sm">{title}</p>
        <button onClick={onClose} className="p-1 text-textMuted">
          <X size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">{children}</div>
      <div className="px-4 py-3 bg-white border-t border-peachLight space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>
    </div>,
    document.body,
  );
}
