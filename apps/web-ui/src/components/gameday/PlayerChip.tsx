import type { Player } from '@lineup/types';
import { PosBadge } from './PosBadge';
import { truncateName } from './truncateName';

export function PlayerChip({
  player,
  pos,
  isHighlight = false,
  dense = false,
  jerseyNumber,
  onClick,
  dark = false,
}: {
  player: Pick<Player, 'id' | 'name'>;
  pos?: string;
  isHighlight?: boolean;
  dense?: boolean;
  jerseyNumber?: number | string;
  onClick?: () => void;
  dark?: boolean;
}) {
  const padding = dense ? 'px-2 py-1' : 'px-3 py-2';
  const surface = dark
    ? 'bg-slate-800 border border-slate-700 text-slate-100'
    : 'bg-white border border-slate-200 text-slate-800';
  const highlight = isHighlight
    ? dark
      ? 'ring-2 ring-amber-400'
      : 'ring-2 ring-green-500'
    : '';
  const interactive = onClick
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all'
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-2 rounded-xl shadow-sm w-full text-left ${padding} ${surface} ${highlight} ${interactive} disabled:cursor-default`}
    >
      {jerseyNumber !== undefined && (
        <span
          className={`font-display text-base flex items-center justify-center w-7 h-7 rounded-full ${
            dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {jerseyNumber}
        </span>
      )}
      <span className="font-bold flex-1 truncate">
        {truncateName(player.name, 14)}
      </span>
      {pos && <PosBadge pos={pos} size={dense ? 'xs' : 'sm'} />}
    </button>
  );
}

export default PlayerChip;
