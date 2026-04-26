import type { Player } from '@lineup/types';
import { PosBadge } from './PosBadge';

export function AtBatCard({
  player,
  pos,
  idx,
  label = 'AT BAT',
  variant = 'primary',
  jerseyNumber,
}: {
  player: Pick<Player, 'id' | 'name'> | null;
  pos?: string;
  idx: number;
  label?: string;
  variant?: 'primary' | 'secondary';
  jerseyNumber?: number | string;
}) {
  const isPrimary = variant === 'primary';
  const surface = isPrimary
    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 shadow-lg'
    : 'bg-slate-800 border border-slate-700 text-slate-100';

  return (
    <div className={`rounded-2xl p-4 ${surface}`}>
      <div className="flex items-baseline justify-between">
        <div className="font-display text-lg tracking-wider">{label}</div>
        <div
          className={`font-display text-sm tracking-wider ${
            isPrimary ? 'text-slate-700' : 'text-slate-400'
          }`}
        >
          #{idx + 1}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-3">
        {jerseyNumber !== undefined && (
          <span
            className={`font-display text-2xl flex items-center justify-center w-12 h-12 rounded-full ${
              isPrimary ? 'bg-slate-900/10 text-slate-900' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {jerseyNumber}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-sans font-extrabold text-2xl truncate leading-tight">
            {player?.name ?? '—'}
          </div>
          {pos && (
            <div className="mt-1">
              <PosBadge pos={pos} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AtBatCard;
