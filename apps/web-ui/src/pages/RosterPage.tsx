import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Player, Team, Position } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const POSITIONS: String[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

function RosterPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    if (!teamId) return;

    fetch(`${API_BASE}/teams/${teamId}`).then(res => res.json()).then(setTeam);
    fetch(`${API_BASE}/teams/${teamId}/players`).then(res => res.json()).then(setPlayers);
  }, [teamId]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !teamId) return;
    const res = await fetch(`${API_BASE}/teams/${teamId}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlayerName.trim() }),
    });
    const created = await res.json();
    setPlayers(p => [...p, created]);
    setNewPlayerName('');
  };

  const togglePreference = async (
    playerId: string,
    pos: Position,
    type: 'preferred' | 'avoid'
  ) => {
    const player = players.find(p => p.id === playerId);
    if (!player || !teamId) return;
    const key = type === 'preferred' ? 'preferredPositions' : 'avoidPositions';
    const current = player[key] ?? [];
    const updated = current.includes(pos)
      ? current.filter(p => p !== pos)
      : [...current, pos];
    const updatedPlayer = { ...player, [key]: updated };
    await fetch(`${API_BASE}/teams/${teamId}/players/${playerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlayer),
    });
    setPlayers(prev => prev.map(p => (p.id === playerId ? updatedPlayer : p)));
  };

  if (!team) return <p>Loading team data...</p>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold">Roster for {team.name}</h2>

      <ul className="space-y-4">
        {players.map(player => (
          <li key={player.id} className="border p-4 rounded bg-white shadow">
            <div className="font-medium mb-2">{player.name}</div>
            <div className="grid grid-cols-2 gap-4">
              <PreferenceButtons
                title="Preferred Positions"
                positions={POSITIONS}
                selected={player.preferredPositions}
                color="blue"
                onClick={pos => togglePreference(player.id, pos, 'preferred')}
              />
              <PreferenceButtons
                title="Avoid Positions"
                positions={POSITIONS}
                selected={player.avoidPositions}
                color="red"
                onClick={pos => togglePreference(player.id, pos, 'avoid')}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddPlayer(); // Trigger the button action
            }
          }}
          className="border p-2 rounded w-full"
          placeholder="Player name"
        />
        <button
          onClick={handleAddPlayer}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Player
        </button>
      </div>
    </div>
  );
}

function PreferenceButtons({
  title,
  positions,
  selected = [],
  color,
  onClick,
}: {
  title: string;
  positions: Position[];
  selected?: Position[];
  color: string;
  onClick: (pos: Position) => void;
}) {
  console.log({ title, positions, selected, color });
  console.log({ selected });
  return (
    <div>
      <div className="text-sm font-semibold mb-1">{title}</div>
      <div className="flex flex-wrap gap-2">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => onClick(pos)}
            className={`text-xs px-3 py-1 border rounded transition-colors duration-200 ${
              selected.includes(pos)
                ? `bg-${color}-600 text-white border-${color}-600`
                : `bg-white text-${color}-600 border-${color}-600 hover:bg-${color}-100`
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RosterPage;
