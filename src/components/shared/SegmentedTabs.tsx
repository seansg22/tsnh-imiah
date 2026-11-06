// one row of equal tabs; a white pill slides to the selected one
export function SegmentedTabs<T extends string>({ options, value, onChange, className = '' }: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  const index = Math.max(0, options.findIndex(o => o.key === value));
  return (
    <div className={`relative flex rounded-full bg-[#EAD8C8] p-1 ${className}`}>
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-full bg-white shadow-md transition-transform duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`relative flex-1 rounded-full py-1 text-[13px] font-bold text-app-text transition-opacity ${o.key === value ? '' : 'opacity-70'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
