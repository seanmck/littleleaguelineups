import { useState } from 'react';
import { useStore } from '../state/store';

function RosterPage() {
  const [newPlayerName, setNewPlayerName] = useState('');
  const activeTeam = useStore(state => state.getActiveTeam());
  const addPlayer = useStore(state => state.addPlayerToActiveTeam);

  const handleAdd = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  if (!activeTeam) return <p>No team selected.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold">Team Roster</h2>
      <ul className="list-disc list-inside space-y-1">
        {activeTeam.players.map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      <div className="pt-4 border-t border-slate-300">
        <input
          type="text"
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          placeholder="Player name"
          className="border p-2 rounded w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          onClick={handleAdd}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Player
        </button>
      </div>
    </div>
  );
}

export default RosterPage;
