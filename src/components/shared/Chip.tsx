import { chipCls } from './chipStyle';

// selectable tag, see chipStyle for the look
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${chipCls(on)}`}
    >
      {children}
    </button>
  );
}
