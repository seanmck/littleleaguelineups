import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Player, Team, Position } from '../types';
import { LoadingState, ErrorBanner, EmptyState, Button, Input } from '../components/ui';
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
  const [flashId, setFlashId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
    setFlashId(created.id);
    setTimeout(() => setFlashId(null), 1000);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display text-green-900">Roster</h2>
        <span className="text-sm text-slate-400 font-semibold">{players.length} players</span>
      </div>

      {/* Add Player — prominent at top */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex gap-3">
          <Input
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddPlayer();
            }}
            placeholder="Add a new player..."
            className="flex-1"
          />
          <Button variant="positive" onClick={handleAddPlayer} className="shrink-0">
            + Add Player
          </Button>
        </div>
      </div>

      {players.length === 0 ? (
        <EmptyState icon="&#9918;" message="No players yet. Add your first player above." />
      ) : (
        <ul ref={listRef} className="space-y-3">
          {players
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(player => (
            <li
              key={player.id}
              className={`rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                flashId === player.id ? 'animate-highlight-flash' : ''
              }`}
            >
              {/* Player header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                {editingId === player.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(player.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(player.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
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
                        className="text-slate-400 hover:text-green-700 text-xs font-semibold transition-colors"
                        title="Rename"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(player.id, player.name)}
                        className="text-slate-400 hover:text-red-600 text-xs font-semibold transition-colors"
                        title="Remove from roster"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Position preferences */}
              <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PreferenceButtons
                  title="Preferred"
                  positions={POSITIONS}
                  selected={players.find(p => p.id === player.id)?.preferredPositions ?? []}
                  color="green"
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
                  title="Avoid"
                  positions={POSITIONS}
                  selected={players.find(p => p.id === player.id)?.avoidPositions ?? []}
                  color="amber"
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
    </div>
  );
}

const colorStyles = {
  green: {
    active: 'bg-green-100 text-green-700 border-green-600 shadow-sm',
    inactive: 'bg-white text-slate-400 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300',
  },
  amber: {
    active: 'bg-amber-100 text-amber-700 border-amber-500 shadow-sm',
    inactive: 'bg-white text-slate-400 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300',
  },
} as const;

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
  color: keyof typeof colorStyles;
  onClick: (pos: Position) => void;
}) {
  const styles = colorStyles[color];
  return (
    <div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => onClick(pos)}
            className={`text-xs px-2.5 py-1 border rounded-lg font-semibold transition-all duration-150 ${
              selected.includes(pos) ? styles.active : styles.inactive
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
