export function InningChips({
  count,
  active,
  onSelect,
  dark = false,
}: {
  count: number;
  active: number;
  onSelect?: (inning: number) => void;
  dark?: boolean;
}) {
  const labelColor = dark ? 'text-slate-400' : 'text-slate-500';
  return (
    <div className="w-full">
      <div className={`font-display text-xs tracking-widest text-center mb-1 ${labelColor}`}>
        INNINGS
      </div>
      <div className="flex justify-between items-center gap-1">
        {Array.from({ length: count }, (_, i) => {
          const isActive = i === active;
          const isPast = i < active;
          const base = 'flex-1 font-display text-2xl tracking-wide py-2 rounded-lg transition-colors text-center';
          const state = isActive
            ? dark
              ? 'bg-amber-400 text-slate-900'
              : 'bg-green-700 text-white'
            : isPast
              ? dark
                ? 'text-slate-500 hover:text-slate-300'
                : 'text-slate-400 hover:text-slate-600'
              : dark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(i)}
              className={`${base} ${state}`}
              aria-label={`Inning ${i + 1}${isActive ? ' (current)' : ''}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InningChips;
