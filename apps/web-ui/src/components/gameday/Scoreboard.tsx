export function Scoreboard({
  home,
  away,
  inning,
  total,
  opponent,
  dark = false,
  onIncrementHome,
  onIncrementAway,
  onDecrementHome,
  onDecrementAway,
}: {
  home: number;
  away: number;
  inning: number;
  total: number;
  opponent?: string;
  dark?: boolean;
  onIncrementHome?: () => void;
  onIncrementAway?: () => void;
  onDecrementHome?: () => void;
  onDecrementAway?: () => void;
}) {
  const surface = dark
    ? 'bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 text-slate-100'
    : 'bg-gradient-to-b from-green-700 to-green-900 text-white';

  const ScoreCell = ({
    label,
    value,
    onInc,
    onDec,
  }: {
    label: string;
    value: number;
    onInc?: () => void;
    onDec?: () => void;
  }) => (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase tracking-wider opacity-80 font-display">{label}</div>
      <div className="flex items-center gap-2">
        {onDec && (
          <button
            type="button"
            onClick={onDec}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-lg leading-none transition-colors"
            aria-label={`Decrease ${label} score`}
          >
            −
          </button>
        )}
        <div className="font-display text-5xl tabular-nums leading-none">{value}</div>
        {onInc && (
          <button
            type="button"
            onClick={onInc}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-lg leading-none transition-colors"
            aria-label={`Increase ${label} score`}
          >
            +
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl px-4 py-3 ${surface}`}>
      <div className="flex items-center justify-between gap-3">
        <ScoreCell label="Us" value={home} onInc={onIncrementHome} onDec={onDecrementHome} />
        <div className="flex flex-col items-center text-center">
          {opponent && (
            <div className="text-xs uppercase tracking-wider opacity-70 font-display">vs {opponent}</div>
          )}
          <div
            className={`mt-1 font-display text-2xl tracking-wide ${dark ? 'text-amber-400' : 'text-amber-300'}`}
          >
            INNING {inning + 1}
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">of {total}</div>
        </div>
        <ScoreCell label={opponent || 'Them'} value={away} onInc={onIncrementAway} onDec={onDecrementAway} />
      </div>
    </div>
  );
}

export default Scoreboard;
