import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Game, BattingOrderStrategy, BATTING_ORDER_STRATEGIES, parseLineup } from '@lineup/types';
import { LoadingState, ErrorBanner, Button, Input } from '../components/ui';
import { apiFetch } from '../lib/api';

interface PreviousGameInfo {
  battingOrder: number[];
  lastBatterIndex: number | null;
  players: Player[];
}

function GameSetupPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [innings, setInnings] = useState(4);
  const [battingOrderStrategy, setBattingOrderStrategy] = useState<BattingOrderStrategy>('rotate');
  const [previousGame, setPreviousGame] = useState<PreviousGameInfo | null>(null);
  const [lastBatterIndex, setLastBatterIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    // Fetch team to get default batting order strategy
    apiFetch(`/teams/${teamId}`)
      .then(res => res.ok ? res.json() : null)
      .then(team => {
        if (team?.battingOrderStrategy) {
          setBattingOrderStrategy(team.battingOrderStrategy);
        }
      })
      .catch(() => {});

    // Fetch previous games to get the most recent batting order
    apiFetch(`/teams/${teamId}/games`)
      .then(res => res.ok ? res.json() : [])
      .then((games: Game[]) => {
        for (const g of games) {
          const parsed = parseLineup(g.lineup);
          if (parsed) {
            setPreviousGame({
              battingOrder: parsed.battingOrder,
              lastBatterIndex: g.lastBatterIndex ?? null,
              players: g.players,
            });
            if (g.lastBatterIndex != null) {
              setLastBatterIndex(g.lastBatterIndex);
            }
            break;
          }
        }
      })
      .catch(() => {});

    apiFetch(`/teams/${teamId}/players`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load players');
        return res.json();
      })
      .then(data => {
        setPlayers(data);
        setSelectedIds(data.map((player: Player) => player.id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load players');
        setLoading(false);
      });
  }, [teamId]);

  const togglePlayer = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateGame = async () => {
    if (!teamId || !date || selectedIds.length === 0) return;

    const body: Record<string, any> = {
      date,
      playerIds: selectedIds,
      innings,
      battingOrderStrategy,
    };

    // If using Continue strategy and coach selected a last batter, pass it along
    if (battingOrderStrategy === 'continue' && lastBatterIndex != null) {
      body.previousGameLastBatterIndex = lastBatterIndex;
    }

    try {
      const res = await apiFetch(`/teams/${teamId}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const created: Game = await res.json();
      navigate(`/teams/${teamId}/games/${created.id}`);
    } catch {
      setError('Failed to create game');
    }
  };

  if (!teamId) return <ErrorBanner message="Team not found." />;
  if (loading) return <LoadingState message="Loading players..." />;
  if (error) return <ErrorBanner message={error} />;

  const selectedCount = selectedIds.length;
  const totalCount = players.length;

  const showLastBatterPicker = battingOrderStrategy === 'continue' && previousGame;
  const prevOrderPlayers = previousGame?.battingOrder.map(id =>
    previousGame.players.find(p => p.id === id) ?? players.find(p => p.id === id)
  ) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display text-green-900">Create New Game</h2>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        <Input
          label="Game Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Innings</label>
          <select
            value={innings}
            onChange={e => setInnings(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Batting Order</label>
          <select
            value={battingOrderStrategy}
            onChange={e => setBattingOrderStrategy(e.target.value as BattingOrderStrategy)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all"
          >
            {BATTING_ORDER_STRATEGIES.map(s => (
              <option key={s.value} value={s.value}>{s.label} — {s.description}</option>
            ))}
          </select>
        </div>

        {/* Last batter picker for Continue strategy */}
        {showLastBatterPicker && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Who batted last in the previous game?
            </label>
            {previousGame.lastBatterIndex != null && lastBatterIndex === previousGame.lastBatterIndex && (
              <p className="text-xs text-green-600 mb-2">
                Already marked from the previous game — change if needed.
              </p>
            )}
            <div className="space-y-1">
              {previousGame.battingOrder.map((playerId, idx) => {
                const player = prevOrderPlayers[idx];
                const isSelected = lastBatterIndex === idx;
                return (
                  <button
                    key={playerId}
                    type="button"
                    onClick={() => setLastBatterIndex(idx)}
                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg border text-left transition-all duration-150 ${
                      isSelected
                        ? 'bg-green-50 border-green-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm">{player?.name ?? `Player #${playerId}`}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs font-semibold text-green-700">Last batter</span>
                    )}
                  </button>
                );
              })}
            </div>
            {lastBatterIndex == null && (
              <p className="mt-2 text-xs text-amber-600">
                Select who batted last so the next game can pick up from there.
              </p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Who's Coming?</h3>
            <span className="text-xs text-slate-400 font-semibold">{selectedCount}/{totalCount} selected</span>
          </div>
          <div className="space-y-2">
            {players
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(p => (
                <label
                  key={p.id}
                  className={`border rounded-lg p-3 cursor-pointer flex items-center justify-between transition-all duration-150 ${
                    selectedIds.includes(p.id)
                      ? 'bg-green-50 border-green-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium text-sm">{p.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => togglePlayer(p.id)}
                    className="rounded"
                  />
                </label>
              ))}
          </div>
        </div>

        <Button variant="primary" onClick={handleCreateGame}>
          Create Game
        </Button>
      </div>
    </div>
  );
}

export default GameSetupPage;
