import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { pageBg } from './cardStyle';

interface Props {
  title: string;
  onClose: () => void;
  footer: React.ReactNode; // pinned at the bottom
  children: React.ReactNode; // scrolls
}

// full-page popup: header on top, body scrolls, footer (the save button) stays at the bottom
export function FullPageForm({ title, onClose, footer, children }: Props) {
  const [scrolled, setScrolled] = useState(false); // the header gets a bottom border once the body scrolls under it
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind must not scroll
    return () => { document.body.style.overflow = prev; };
  }, []);

  // portal: a transformed ancestor (page fade-in) would otherwise trap position: fixed
  return createPortal(
    <div className={`fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] ${pageBg} flex flex-col`}>
      {/* body first: it scrolls under the header and the footer, which float above it */}
      <div onScroll={e => setScrolled(e.currentTarget.scrollTop > 0)} className="flex-1 overflow-y-auto px-4 pt-[4.25rem] pb-28 space-y-4">{children}</div>
      {/* same look as a page title; the content scrolling under it is blurred evenly, up to the border */}
      <div className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b px-4 pt-3 pb-2 transition-[border-color,box-shadow] duration-200 ${scrolled ? 'border-peach/40 shadow-[0_10px_30px_rgba(155,123,110,0.35)]' : 'border-transparent'}`}>
        <div className="absolute inset-0 pointer-events-none backdrop-blur-[24px]" />
        <h1 className="relative text-2xl font-extrabold text-app-text">{title}</h1>
        <button onClick={onClose} className="relative p-1.5 text-textMuted">
          <X size={22} strokeWidth={2} />
        </button>
      </div>
      {/* like the app bottom bar: no background, the content scrolling under it is blurred, fading out upward */}
      <div className="absolute inset-x-0 bottom-0 px-4 pt-3 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          className="absolute inset-x-0 top-0 bottom-0 pointer-events-none backdrop-blur-[5px]"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 45%)',
            maskImage: 'linear-gradient(to bottom, transparent, black 45%)',
          }}
        />
        <div className="relative space-y-2 [&_button]:rounded-full [&_button]:shadow-[0_8px_20px_rgba(232,135,90,0.4)]">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}
