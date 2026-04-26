export function TabSwitcher<T extends string>({
  tabs,
  value,
  onChange,
  dark = false,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (next: T) => void;
  dark?: boolean;
}) {
  const trackBg = dark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100';
  return (
    <div className={`inline-flex rounded-full p-1 ${trackBg}`} role="tablist">
      {tabs.map(tab => {
        const isActive = tab === value;
        const activeStyle = dark
          ? 'bg-amber-400 text-slate-900'
          : 'bg-white text-green-900 shadow-sm';
        const inactiveStyle = dark ? 'text-slate-300' : 'text-slate-600';
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`px-4 py-1.5 rounded-full font-display text-sm tracking-wider transition-colors ${
              isActive ? activeStyle : inactiveStyle
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
