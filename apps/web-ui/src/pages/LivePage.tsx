import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Lineup, Player, Position } from '@lineup/types';
import { LoadingState, ErrorBanner } from '../components/ui';
import {
  Scoreboard,
  InningChips,
  TabSwitcher,
  FieldDiagram,
  PlayerChip,
  AtBatCard,
  PosBadge,
} from '../components/gameday';
import { useLiveGame } from '../hooks/useLiveGame';
import { useWakeLock } from '../hooks/useWakeLock';

type Tab = 'DEFENSE' | 'BATTING';
const TABS: readonly Tab[] = ['DEFENSE', 'BATTING'] as const;

function getBenchIds(lineup: Lineup, inning: number): number[] {
  const ip = lineup.innings[inning];
  if (!ip) return [];
  const v = ip['Bench'];
  if (Array.isArray(v)) return v;
  return [];
}

function getFieldPositions(lineup: Lineup, inning: number): Position[] {
  const ip = lineup.innings[inning];
  if (!ip) return [];
  return (Object.keys(ip).filter(k => k !== 'Bench') as Position[]).sort();
}

function findPositionOf(lineup: Lineup, inning: number, playerId: number): string | null {
  const ip = lineup.innings[inning];
  if (!ip) return null;
  for (const [pos, v] of Object.entries(ip)) {
    if (Array.isArray(v)) {
      if (v.includes(playerId)) return pos;
    } else if (v === playerId) {
      return pos;
    }
  }
  return null;
}

function swapBench(
  lineup: Lineup,
  inning: number,
  fielderPos: Position,
  benchPid: number
): Lineup {
  const next: Lineup = JSON.parse(JSON.stringify(lineup));
  const ip = next.innings[inning];
  if (!ip) return next;
  const fielderPid = ip[fielderPos];
  if (typeof fielderPid !== 'number') return next;

  ip[fielderPos] = benchPid;
  const bench = Array.isArray(ip['Bench']) ? (ip['Bench'] as number[]) : [];
  const idx = bench.indexOf(benchPid);
  if (idx !== -1) bench[idx] = fielderPid;
  else bench.push(fielderPid);
  ip['Bench'] = bench;
  return next;
}

function vibrate(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // ignore
    }
  }
}

function LivePage() {
  const { teamId, gameId } = useParams();
  const navigate = useNavigate();
  const live = useLiveGame(teamId, gameId);
  const [tab, setTab] = useState<Tab>('DEFENSE');
  const [subForPos, setSubForPos] = useState<Position | null>(null);

  useWakeLock(true);

  // Add a body class so we can override the global gradient background for /live
  useEffect(() => {
    document.body.classList.add('live-mode');
    return () => {
      document.body.classList.remove('live-mode');
    };
  }, []);

  const battingOrder = live.lineup?.battingOrder ?? [];
  const inningsCount = live.game?.innings ?? 4;
  const currentInning = live.game?.currentInning ?? 0;
  const atBatIdx = live.game?.atBatIdx ?? 0;
  const playersById = useMemo(
    () => new Map((live.game?.players ?? []).map(p => [p.id, p])),
    [live.game?.players]
  );

  if (live.loading) return <LoadingState message="Loading game…" />;
  if (live.error && !live.game) return <ErrorBanner message={live.error} />;
  if (!live.game || !live.lineup) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>This game has no lineup yet.</p>
        <Link
          to={`/teams/${teamId}/games/${gameId}/plan`}
          className="mt-3 inline-block text-green-700 hover:text-green-900 underline"
        >
          ← Back to plan
        </Link>
      </div>
    );
  }

  const lineup = live.lineup;
  const game = live.game;

  const inningPositions = lineup.innings[currentInning] ?? {};
  const fieldPositions = getFieldPositions(lineup, currentInning);
  const benchIds = getBenchIds(lineup, currentInning);

  const currentBatterId = battingOrder[atBatIdx];
  const currentBatter = currentBatterId != null ? playersById.get(currentBatterId) : undefined;
  const currentBatterPos = currentBatterId != null
    ? findPositionOf(lineup, currentInning, currentBatterId)
    : null;

  const onDeckIdx = battingOrder.length > 0 ? (atBatIdx + 1) % battingOrder.length : 0;
  const onDeckId = battingOrder[onDeckIdx];
  const onDeckPlayer = onDeckId != null ? playersById.get(onDeckId) : undefined;
  const onDeckPos = onDeckId != null ? findPositionOf(lineup, currentInning, onDeckId) : null;

  const upNextIds = battingOrder.length > 2
    ? Array.from({ length: battingOrder.length - 2 }, (_, i) =>
        battingOrder[(atBatIdx + 2 + i) % battingOrder.length]
      )
    : [];

  const isFinalInning = currentInning >= inningsCount - 1;

  const handleNextBatter = () => {
    if (battingOrder.length === 0) return;
    vibrate(10);
    live.setAtBatIdx((atBatIdx + 1) % battingOrder.length);
  };

  const handleEndInning = () => {
    if (isFinalInning) {
      navigate(`/teams/${teamId}/games/${gameId}/plan`);
      return;
    }
    live.setCurrentInning(currentInning + 1);
  };

  const handleFielderTap = (_player: Pick<Player, 'id' | 'name'>, pos: Position) => {
    setSubForPos(pos);
  };

  const handleBenchSwap = (benchPid: number) => {
    if (!subForPos) return;
    const next = swapBench(lineup, currentInning, subForPos, benchPid);
    live.setLineup(next);
    setSubForPos(null);
  };

  return (
    <div className="-mx-4 sm:mx-0 min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 pb-6 pt-3 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <Link
            to={`/teams/${teamId}/games/${gameId}/plan`}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            ← Plan
          </Link>
          {live.error && (
            <button
              type="button"
              onClick={live.clearError}
              className="text-amber-400"
              aria-label="Dismiss error"
            >
              {live.error} ✕
            </button>
          )}
        </div>

        <Scoreboard
          dark
          home={game.homeScore ?? 0}
          away={game.awayScore ?? 0}
          inning={currentInning}
          total={inningsCount}
          opponent={game.opponent ?? undefined}
          onIncrementHome={() => live.setHomeScore((game.homeScore ?? 0) + 1)}
          onDecrementHome={() => live.setHomeScore(Math.max(0, (game.homeScore ?? 0) - 1))}
          onIncrementAway={() => live.setAwayScore((game.awayScore ?? 0) + 1)}
          onDecrementAway={() => live.setAwayScore(Math.max(0, (game.awayScore ?? 0) - 1))}
        />

        <InningChips
          dark
          count={inningsCount}
          active={currentInning}
          onSelect={n => live.setCurrentInning(n)}
        />

        {/* Tab switcher: mobile-only; desktop shows both columns */}
        <div className="flex justify-center pt-1 lg:hidden">
          <TabSwitcher dark tabs={TABS} value={tab} onChange={setTab} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-6 lg:items-stretch">
          {/* DEFENSE column */}
          <div className={`flex-col gap-3 ${tab === 'DEFENSE' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2 mx-auto w-full max-w-2xl lg:max-w-none">
              <FieldDiagram
                inning={inningPositions}
                players={game.players}
                positions={fieldPositions}
                highlightPid={currentBatterId}
                onPlayerTap={handleFielderTap}
              />
            </div>

            {benchIds.length > 0 && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 lg:flex-1">
                <div className="font-display text-sm tracking-widest text-slate-400 mb-2">
                  BENCH
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {benchIds.map(pid => {
                    const p = playersById.get(pid);
                    if (!p) return null;
                    return (
                      <PlayerChip
                        key={pid}
                        dark
                        dense
                        player={p}
                        pos="Bench"
                        onClick={subForPos ? () => handleBenchSwap(pid) : undefined}
                        isHighlight={subForPos != null}
                      />
                    );
                  })}
                </div>
                {subForPos && (
                  <p className="mt-3 text-xs text-amber-300">
                    Tap a bench player to sub them in at <PosBadge pos={subForPos} size="xs" />.
                    {' '}
                    <button
                      type="button"
                      onClick={() => setSubForPos(null)}
                      className="underline"
                    >
                      Cancel
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BATTING column */}
          <div className={`flex-col gap-3 ${tab === 'BATTING' ? 'flex' : 'hidden lg:flex'}`}>
            <AtBatCard
              player={currentBatter ?? null}
              pos={currentBatterPos ?? undefined}
              idx={atBatIdx}
              label="AT BAT"
              variant="primary"
            />
            {onDeckPlayer && (
              <AtBatCard
                player={onDeckPlayer}
                pos={onDeckPos ?? undefined}
                idx={onDeckIdx}
                label="ON DECK"
                variant="secondary"
              />
            )}
            {upNextIds.length > 0 && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 lg:flex-1">
                <div className="font-display text-sm tracking-widest text-slate-400 mb-2">
                  UP NEXT
                </div>
                <ol className="space-y-1.5">
                  {upNextIds.map((pid, i) => {
                    const p = playersById.get(pid);
                    if (!p) return null;
                    const pos = findPositionOf(lineup, currentInning, pid);
                    const orderIdx = (atBatIdx + 2 + i) % battingOrder.length;
                    return (
                      <li key={`${pid}-${i}`} className="flex items-center gap-2 text-slate-200">
                        <span className="font-display text-base w-7 text-right text-slate-400">
                          {orderIdx + 1}.
                        </span>
                        <span className="font-bold flex-1 truncate">{p.name}</span>
                        {pos && <PosBadge pos={pos} size="xs" />}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Action bar (in flow, immediately under the content) */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleNextBatter}
            disabled={battingOrder.length === 0}
            className="flex-1 rounded-xl bg-positive hover:bg-positive-hover disabled:opacity-50 text-white font-display text-lg tracking-wider py-3 transition-colors active:scale-[0.98]"
            aria-label="Advance to next batter"
          >
            Next Batter ›
          </button>
          <button
            type="button"
            onClick={handleEndInning}
            className="rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-display text-lg tracking-wider py-3 px-5 transition-colors active:scale-[0.98]"
            aria-label={isFinalInning ? 'End game and return to plan' : 'End current inning'}
          >
            {isFinalInning ? 'End Game' : 'End Inning'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LivePage;
