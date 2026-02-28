import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Player, Team, Position } from '../types';
import { LoadingState, ErrorBanner, EmptyState, Button } from '../components/ui';
import { apiFetch } from '../lib/api';

const POSITIONS: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

function RosterPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!teamId) return;

    apiFetch(`/teams/${teamId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load team');
        return res.json();
      })
      .then(setTeam)
      .catch(() => setError('Failed to load team data'));

    apiFetch(`/teams/${teamId}/players`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load players');
        return res.json();
      })
      .then(setPlayers)
      .catch(() => setError('Failed to load players'));
  }, [teamId]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !teamId) return;
    const res = await apiFetch(`/teams/${teamId}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlayerName.trim() }),
    });
    const created = await res.json();
    setPlayers(p => [...p, created]);
    setNewPlayerName('');
  };

  const handleRename = async (playerId: string) => {
    if (!editingName.trim() || !teamId) return;
    const res = await apiFetch(`/teams/${teamId}/players/${playerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    const updated = await res.json();
    setPlayers(prev => prev.map(p => (p.id === playerId ? updated : p)));
    setEditingId(null);
  };

  const handleDelete = async (playerId: string, playerName: string) => {
    if (!teamId || !confirm(`Remove ${playerName} from the roster?`)) return;
    const res = await apiFetch(`/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
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
    await apiFetch(`/teams/${teamId}/players/${playerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlayer),
    });
    setPlayers(prev => prev.map(p => (p.id === playerId ? updatedPlayer : p)));
  };

  if (error) return <ErrorBanner message={error} />;
  if (!team) return <LoadingState message="Loading team data..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Roster for {team.name}</h2>

      {players.length === 0 ? (
        <EmptyState icon="&#9918;" message="No players yet. Add your first player below." />
      ) : (
        <ul className="space-y-4">
          {players
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(player => (
            <li key={player.id} className="border border-slate-100 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                {editingId === player.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(player.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="border border-slate-300 rounded px-2 py-1 text-sm flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(player.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-slate-800">{player.name}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingId(player.id);
                          setEditingName(player.name);
                        }}
                        className="text-slate-400 hover:text-blue-600 text-xs"
                        title="Rename"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(player.id, player.name)}
                        className="text-slate-400 hover:text-red-600 text-xs"
                        title="Remove from roster"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PreferenceButtons
                  title="Preferred Positions"
                  positions={POSITIONS}
                  selected={players.find(p => p.id === player.id)?.preferredPositions ?? []}
                  color="blue"
                  onClick={pos => {
                    setPlayers(prev =>
                      prev.map(p =>
                        p.id === player.id
                          ? {
                              ...p,
                              preferredPositions: p.preferredPositions?.includes(pos)
                                ? p.preferredPositions.filter(pp => pp !== pos)
                                : [...(p.preferredPositions ?? []), pos],
                            }
                          : p
                      )
                    );
                    togglePreference(player.id, pos, 'preferred');
                  }}
                />
                <PreferenceButtons
                  title="Avoid Positions"
                  positions={POSITIONS}
                  selected={players.find(p => p.id === player.id)?.avoidPositions ?? []}
                  color="red"
                  onClick={pos => {
                    setPlayers(prev =>
                      prev.map(p =>
                        p.id === player.id
                          ? {
                              ...p,
                              avoidPositions: p.avoidPositions?.includes(pos)
                                ? p.avoidPositions.filter(ap => ap !== pos)
                                : [...(p.avoidPositions ?? []), pos],
                            }
                          : p
                      )
                    );
                    togglePreference(player.id, pos, 'avoid');
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddPlayer();
            }
          }}
          className="border p-2 rounded w-full"
          placeholder="Player name"
        />
        <Button variant="positive" onClick={handleAddPlayer}>
          Add Player
        </Button>
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
