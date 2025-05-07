import { useState } from 'react';
import { useStore } from '../state/store';
import { useNavigate } from 'react-router-dom';

function GameSetupPage() {
  const activeTeam = useStore(state => state.getActiveTeam());
  const addGame = useStore(state => state.addGameToActiveTeam);
  const [date, setDate] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    activeTeam ? activeTeam.players.map(p => p.id) : []
  );
  const navigate = useNavigate();


  const handleToggle = (id: string) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const game = addGame(date, selectedPlayers);
    if (game) {
      navigate(`/games/${game.id}`);
    }
  };

  if (!activeTeam) return <p>No team selected.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold">Game Setup</h2>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <p className="text-slate-600 text-sm">Uncheck any players who will not be at the game:</p>

      <div className="pt-4 space-y-2">
        {activeTeam.players.map(player => (
          <label key={player.id} className="block">
            <input
              type="checkbox"
              checked={selectedPlayers.includes(player.id)}
              onChange={() => handleToggle(player.id)}
              className="mr-2"
            />
            {player.name}
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Create Game
      </button>
    </div>
  );
}

export default GameSetupPage;
