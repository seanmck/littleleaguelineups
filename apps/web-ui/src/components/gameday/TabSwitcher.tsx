export function TabSwitcher<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      className="inline-flex flex-shrink-0 rounded-md border border-slate-700 bg-slate-800 p-0.5"
      role="tablist"
    >
      {tabs.map(tab => {
        const isActive = tab === value;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`rounded px-2.5 py-1 font-display text-[11px] tracking-wider transition-colors ${
              isActive ? 'bg-green-700 text-white' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export default TabSwitcher;
