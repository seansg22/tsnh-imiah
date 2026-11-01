import { Check } from 'lucide-react';

// small checkbox with a label (the native input is hidden, the box is drawn)
export function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs font-bold text-app-text cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-peach/40 rounded">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-md border-2 border-peachLight bg-white text-transparent transition-colors peer-checked:bg-peach peer-checked:border-peach peer-checked:text-white">
        <Check size={14} strokeWidth={3.5} />
      </span>
      {label}
    </label>
  );
}
