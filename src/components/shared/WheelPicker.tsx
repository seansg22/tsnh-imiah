import { useRef, useState } from 'react';

const STEP_PX = 12; // drag distance for one step (2 ridges)
const RIDGE_PX = 6;

interface Props {
  options: number[];
  value: number | undefined; // undefined = nothing picked
  onChange: (v: number | undefined) => void;
  unit?: string;
  required?: boolean; // a value is always picked
}

// Looks like a Logitech keyboard volume control in the app's peach colors: a soft
// display and a ridged roller. Type a number, or drag the roller up/down.
// The roller shows no value and a tap does nothing, so a page scroll never changes it.
export function WheelPicker({ options, value, onChange, unit, required }: Props) {
  const drag = useRef<{ y: number; i: number } | null>(null);
  const rollBase = useRef(0); // roller position kept between drags (movementY is missing on some Safari)
  const [roll, setRoll] = useState(0); // ridges slide by this many px
  const [dragging, setDragging] = useState(false);
  const [typing, setTyping] = useState<string | null>(null); // null = show value
  const text = typing ?? value?.toString() ?? '';

  // current position in options (nearest one if the typed value is not listed)
  function indexOfValue() {
    if (value === undefined) return -1;
    let best = 0;
    options.forEach((o, i) => { if (Math.abs(o - value) < Math.abs(options[best] - value)) best = i; });
    return best;
  }

  function moveTo(i: number) {
    const v = i < 0 && !required ? undefined : options[Math.min(options.length - 1, Math.max(0, i))];
    if (v === value) return;
    onChange(v);
    navigator.vibrate?.(6); // tiny click on phones that support it
  }

  function handleType(raw: string) {
    setTyping(raw);
    if (raw === '') return required ? undefined : onChange(undefined);
    const n = Number(raw);
    if (Number.isFinite(n) && n !== value) onChange(n);
  }

  function endDrag() {
    drag.current = null;
    rollBase.current = roll;
    setDragging(false);
  }

  return (
    <div className="flex items-center gap-1 w-full">
      {/* soft display */}
      <div
        className="flex-1 min-w-0 flex items-center gap-1 rounded-lg px-1.5"
        style={{ background: '#FFF8F2', border: '1px solid #FFE3CC' }}
      >
        <input
          type="number"
          inputMode="numeric"
          value={text}
          placeholder="–"
          onChange={e => handleType(e.target.value)}
          onBlur={() => setTyping(null)}
          className="w-full min-w-0 bg-transparent py-1.5 text-center text-sm font-bold tabular-nums outline-none placeholder:text-textMuted/40"
          style={{ color: '#3D2B1F' }}
        />
        {unit && <span className="text-xs shrink-0" style={{ color: '#9B7B6E' }}>{unit}</span>}
      </div>

      {/* LED, lights up while the roller moves */}
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full transition-all"
        style={{
          background: dragging ? '#E8875A' : '#FFE3CC',
          boxShadow: dragging ? '0 0 6px 2px rgba(255,171,118,.9)' : 'none',
        }}
      />

      {/* roller slot */}
      <div
        className="shrink-0 rounded-lg p-0.5"
        style={{ background: '#F5E6D3', border: '1px solid #FFE3CC', boxShadow: 'inset 0 2px 4px rgba(155,123,110,.2), 0 1px 0 #fff' }}
      >
        <button
          type="button"
          aria-label="Drag up or down to change"
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { y: e.clientY, i: indexOfValue() };
            setDragging(true);
          }}
          onPointerMove={e => {
            if (!drag.current) return;
            setTyping(null);
            setRoll(rollBase.current + e.clientY - drag.current.y);
            moveTo(drag.current.i + Math.round((drag.current.y - e.clientY) / STEP_PX));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={e => {
            if (e.key === 'ArrowUp') moveTo(indexOfValue() + 1);
            if (e.key === 'ArrowDown') moveTo(indexOfValue() - 1);
          }}
          className="block w-7 h-7 rounded-md cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-peachDark"
          style={{
            touchAction: 'none',
            backgroundColor: '#FFCBA8',
            // top layer: round metal shading, bottom layer: engraved ridges that slide with the drag
            backgroundImage: [
              'linear-gradient(to bottom, rgba(150,70,30,.28) 0%, rgba(255,255,255,.5) 28%, rgba(255,255,255,.1) 50%, rgba(150,70,30,.1) 78%, rgba(150,70,30,.3) 100%)',
              `repeating-linear-gradient(to bottom, rgba(150,70,30,.18) 0 2px, rgba(255,255,255,.4) 2px 3px, transparent 3px ${RIDGE_PX}px)`,
            ].join(', '),
            backgroundPosition: `0 0, 0 ${roll}px`,
            boxShadow: 'inset 2px 0 2px rgba(150,70,30,.15), inset -2px 0 2px rgba(150,70,30,.15)',
          }}
        />
      </div>
    </div>
  );
}
