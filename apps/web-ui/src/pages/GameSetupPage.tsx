import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Game } from '../types';
import { LoadingState, ErrorBanner, Button, Input } from '../components/ui';
import { apiFetch } from '../lib/api';

function GameSetupPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [innings, setInnings] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;
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

    try {
      const res = await apiFetch(`/teams/${teamId}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, playerIds: selectedIds, innings }),
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
