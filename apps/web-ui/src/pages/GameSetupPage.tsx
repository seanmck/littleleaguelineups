import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Game } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function GameSetupPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!teamId) return;
    fetch(`${API_BASE}/teams/${teamId}/players`)
      .then(res => res.json())
      .then(players => {
        setPlayers(players);
        setSelectedIds(players.map(player => player.id)); // Select all players by default
      })
      .catch(err => console.error('Error loading players:', err));
  }, [teamId]);

  const togglePlayer = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateGame = async () => {
    if (!teamId || !date || selectedIds.length === 0) return;

    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, playerIds: selectedIds }),
      });

      const created: Game = await res.json();
      navigate(`/teams/${teamId}/games/${created.id}`);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  if (!teamId) return <p>Team not found.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6 mx-auto max-w-7xl">
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
        <div className="space-y-2"> {/* Use vertical spacing */}
          {players
            .slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort players alphabetically by name
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

      <button
        onClick={handleCreateGame}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Create Game
      </button>
    </div>
  );
}

export default GameSetupPage;
