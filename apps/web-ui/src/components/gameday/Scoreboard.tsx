import { useRef } from 'react';

const HOLD_MS = 450;

function vibrate(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* ignore */
    }
  }
}

function Score({
  value,
  label,
  onInc,
  onDec,
}: {
  value: number;
  label: string;
  onInc?: () => void;
  onDec?: () => void;
}) {
  const timerRef = useRef<number | null>(null);
  const heldRef = useRef(false);
  const handledByPointerRef = useRef(false);

  const cancelTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerDown = () => {
    handledByPointerRef.current = true;
    heldRef.current = false;
    cancelTimer();
    timerRef.current = window.setTimeout(() => {
      heldRef.current = true;
      vibrate(15);
      onDec?.();
    }, HOLD_MS);
  };

  const handlePointerUp = () => {
    cancelTimer();
    if (!heldRef.current) onInc?.();
  };

  const handlePointerLeave = () => {
    cancelTimer();
    heldRef.current = true; // don't increment if pointer left the button
  };

  const handleClick = () => {
    if (handledByPointerRef.current) {
      handledByPointerRef.current = false;
      return;
    }
    // Keyboard activation falls through here (no preceding pointer events).
    onInc?.();
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onClick={handleClick}
      aria-label={`${label} score: ${value}. Tap to add a run, hold to subtract.`}
      className="font-display text-[22px] leading-none text-white tabular-nums select-none touch-manipulation"
    >
      {value}
    </button>
  );
}

export function Scoreboard({
  home,
  away,
  inning,
  total,
  opponent,
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
  onIncrementHome?: () => void;
  onIncrementAway?: () => void;
  onDecrementHome?: () => void;
  onDecrementAway?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[#1e293b] bg-[#020617] px-3 py-2">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-extrabold tracking-widest text-white">
          ● LIVE
        </span>
        {opponent && (
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748b]">
            vs {opponent}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <Score value={home} onInc={onIncrementHome} onDec={onDecrementHome} label="Us" />
        <span className="text-[11px] text-[#475569]">—</span>
        <Score
          value={away}
          onInc={onIncrementAway}
          onDec={onDecrementAway}
          label={opponent ?? 'Them'}
        />
        <span className="mx-0.5 h-[18px] w-px bg-[#1e293b]" aria-hidden="true" />
        <div className="flex items-baseline">
          <span className="font-display text-[20px] leading-none text-[#fbbf24] tabular-nums">
            I{inning + 1}
          </span>
          <span className="text-[11px] text-[#475569]">/{total}</span>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
