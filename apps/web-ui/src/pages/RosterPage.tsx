import { useState } from 'react';
import { useStore } from '../state/store';
import { Position } from '../types';

function RosterPage() {
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const activeTeam = useStore(state =>
    state.teams.find(t => t.id === state.selectedTeamId)
  );
  const addPlayerToActiveTeam = useStore(state => state.addPlayerToActiveTeam);
  const updatePlayerInActiveTeam = useStore(state => state.updatePlayerInActiveTeam);

  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayerToActiveTeam(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const togglePreference = (
    playerId: string,
    pos: Position,
    type: 'preferred' | 'avoid'
  ) => {
    if (!activeTeam) return;
    const player = activeTeam.players.find(p => p.id === playerId);
    if (!player) return;

    const key = type === 'preferred' ? 'preferredPositions' : 'avoidPositions';
    const existing = player[key] ?? [];

    const updated = existing.includes(pos)
      ? existing.filter(p => p !== pos)
      : [...existing, pos];

    updatePlayerInActiveTeam({
      ...player,
      [key]: updated,
    });
  };

  if (!activeTeam) return <p>No team selected.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Team Roster: {activeTeam.name}</h2>

      <ul className="divide-y divide-slate-200">
        {activeTeam.players.map((player) => (
          <li key={player.id} className="py-4">
            
            <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-800">{player.name}</span>
            <button
              className="text-sm text-blue-600 hover:underline px-4 py-2 rounded min-w-[160px]"
              onClick={() => setExpandedPlayerId(p => (p === player.id ? null : player.id))}
            >
              {expandedPlayerId === player.id ? 'Hide Preferences' : 'Manage Preferences'}
            </button>
          </div>
          {expandedPlayerId === player.id && (
              <div className="flex flex-wrap gap-2 mt-1">
              {(
                ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'] as Position[]
              ).map((pos) => (
                <div key={pos} className="text-xs">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={player.preferredPositions?.includes(pos) ?? false}
                      onChange={() => togglePreference(player.id, pos, 'preferred')}
                    />
                    <span className="text-blue-800">{pos}</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={player.avoidPositions?.includes(pos) ?? false}
                      onChange={() => togglePreference(player.id, pos, 'avoid')}
                    />
                    <span className="text-red-700 line-through">{pos}</span>
                  </label>
                </div>
              ))}
            </div>
            )}            
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddPlayer}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded whitespace-nowrap min-w-[160px]"
        >
          Add Player
        </button>
      </div>
    </div>
  );
}

export default RosterPage;
