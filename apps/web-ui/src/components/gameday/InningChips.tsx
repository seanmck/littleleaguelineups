export function InningChips({
  count,
  active,
  onSelect,
}: {
  count: number;
  active: number;
  onSelect?: (inning: number) => void;
}) {
  return (
    <div className="flex flex-1 gap-[3px]">
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active;
        const cls = isActive
          ? 'bg-amber-400 text-slate-900 border-amber-400'
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect?.(i)}
            className={`flex-1 rounded-[5px] border py-1.5 font-display text-[11px] tracking-wider transition-colors ${cls}`}
            aria-label={`Inning ${i + 1}${isActive ? ' (current)' : ''}`}
            aria-current={isActive ? 'true' : undefined}
          >
            I{i + 1}
          </button>
        );
      })}
    </div>
  );
}

export default InningChips;
