import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ITEM_H = 28;
const ROWS = 3; // visible rows, the middle one is selected

interface Props {
  options: number[];
  value: number | undefined; // undefined = nothing picked (first "–" row)
  onChange: (v: number | undefined) => void;
  unit?: string;
}

// iPhone-style wheel: scroll-snap list, the row under the highlight bar is the value.
export function WheelPicker({ options, value, onChange, unit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rows: (number | undefined)[] = [undefined, ...options];

  // jump to the initial value once; later changes come from the wheel itself
  useEffect(() => {
    const i = Math.max(0, rows.indexOf(value));
    if (ref.current) ref.current.scrollTop = i * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const i = Math.min(rows.length - 1, Math.max(0, Math.round(ref.current.scrollTop / ITEM_H)));
      if (rows[i] !== value) onChange(rows[i]);
    }, 80);
  }

  return (
    <div className="relative mx-auto w-28">
    <div className="relative rounded-xl bg-cream border border-peachLight overflow-hidden" style={{ height: ITEM_H * ROWS }}>
      <div
        className="absolute inset-x-0 pointer-events-none border-y border-peach bg-peachLight/40"
        style={{ top: ITEM_H, height: ITEM_H }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="relative h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}
      >
        {rows.map((r, i) => (
          <button
            key={r ?? 'none'}
            type="button"
            onClick={() => ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })}
            className={`snap-center w-full flex items-center justify-center text-sm ${r === value ? 'font-extrabold text-app-text' : 'text-textMuted'}`}
            style={{ height: ITEM_H }}
          >
            {r === undefined ? '–' : `${r}${unit ? ` ${unit}` : ''}`}
          </button>
        ))}
      </div>
    </div>
    {value !== undefined && (
      <button
        type="button"
        aria-label="Clear"
        onClick={() => { ref.current?.scrollTo({ top: 0, behavior: 'smooth' }); onChange(undefined); }}
        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-warm text-textMuted hover:text-peachDark transition-colors"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    )}
    </div>
  );
}
