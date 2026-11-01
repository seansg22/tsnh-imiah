// Little swirl of poop with a face, drawn in the given color (SVG, not emoji).
export function PoopIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <g fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeLinejoin="round">
        <rect x="2.5" y="15" width="19" height="6.5" rx="3.25" />
        <rect x="5.5" y="9.5" width="13" height="6.5" rx="3.25" />
        <path d="M9 10 C8.5 6.5 11.5 5.5 12 2.5 C14.5 4 16 7 15 10 Z" />
      </g>
      <circle cx="9.5" cy="13" r="1.2" fill="#fff" />
      <circle cx="14.5" cy="13" r="1.2" fill="#fff" />
      <circle cx="9.7" cy="13.1" r="0.55" fill="#222" />
      <circle cx="14.7" cy="13.1" r="0.55" fill="#222" />
    </svg>
  );
}
