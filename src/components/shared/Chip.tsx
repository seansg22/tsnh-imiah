import { chipCls } from './chipStyle';

// selectable tag, see chipStyle for the look; long typed text wraps inside the tag instead of running off the card
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex max-w-full items-center gap-1.5 px-3 py-1 rounded-full text-left text-xs font-bold [overflow-wrap:anywhere] ${chipCls(on)}`}
    >
      {children}
    </button>
  );
}
