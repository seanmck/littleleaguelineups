import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Game } from '../types';
import { LoadingState, ErrorBanner, Button } from '../components/ui';
import { apiFetch } from '../lib/api';

function GameSetupPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState('');
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
        body: JSON.stringify({ date, playerIds: selectedIds }),
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6">
      <h2 className="text-xl font-bold">Create New Game</h2>

      <label className="block">
        <span className="text-sm font-medium">Game Date</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mt-1 block w-full border p-2 rounded"
        />
      </label>

      <div>
        <h3 className="text-sm font-medium mb-2">Who's Coming?</h3>
        <div className="space-y-2">
          {players
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(p => (
              <label
                key={p.id}
                className={`border p-2 rounded cursor-pointer flex items-center justify-between ${
                  selectedIds.includes(p.id)
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-white border-slate-300'
                }`}
              >
                <span>{p.name}</span>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => togglePlayer(p.id)}
                />
              </label>
            ))}
        </div>
      </div>

      <Button variant="primary" onClick={handleCreateGame}>
        Create Game
      </Button>
    </div>
  );
}

export default GameSetupPage;
