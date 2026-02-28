import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Game, Player, calculateGameResult } from '@lineup/types';
import { LoadingState, ErrorBanner, Button } from '../components/ui';
import { apiFetch } from '../lib/api';

function getPositionColor(position: string): string {
  if (position === 'P') return 'bg-red-100';
  if (position === 'C') return 'bg-blue-100';
  if (['1B', '2B', '3B', 'SS'].includes(position)) return 'bg-green-100';
  if (['LF', 'CF', 'RF', 'LCF', 'RCF'].includes(position)) return 'bg-yellow-100';
  return 'bg-slate-100'; // Bench
}

function GameDetailPage() {
  const { gameId, teamId } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    opponent: '',
    homeScore: '',
    awayScore: '',
  });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!teamId || !gameId) return;

    apiFetch(`/teams/${teamId}/games/${gameId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game details');
        return res.json();
      })
      .then(data => {
        setGame(data);
        setEditForm({
          opponent: data.opponent || '',
          homeScore: data.homeScore?.toString() || '',
          awayScore: data.awayScore?.toString() || '',
        });
        setSelectedPlayerIds(data.players.map((p: Player) => p.id.toString()));
      })
      .catch(() => setError('Failed to load game details'));

    apiFetch(`/teams/${teamId}/players`)
      .then(res => res.json())
      .then(setAllPlayers)
      .catch(() => {});
  }, [teamId, gameId]);

  const handleSave = async () => {
    if (!teamId || !gameId) return;
    setIsSaving(true);

    const updateData = {
      opponent: editForm.opponent || null,
      homeScore: editForm.homeScore ? parseInt(editForm.homeScore) : null,
      awayScore: editForm.awayScore ? parseInt(editForm.awayScore) : null,
      playerIds: selectedPlayerIds,
    };

    try {
      const res = await apiFetch(`/teams/${teamId}/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updated = await res.json();
        setGame(updated);
        setIsEditing(false);
      } else {
        setError('Failed to update game');
      }
    } catch {
      setError('Failed to update game');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  if (error) return <ErrorBanner message={error} />;
  if (!game) return <LoadingState message="Loading game details..." />;

  const formattedDate = new Date(game.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const result = calculateGameResult(game.homeScore, game.awayScore);
  const resultDisplay = result
    ? `${result === 'W' ? 'Won' : result === 'L' ? 'Lost' : 'Tied'} ${game.homeScore}-${game.awayScore}`
    : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6">
      {/* Header with back link */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            to={`/teams/${teamId}/games`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            &larr; Back to Schedule
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">{formattedDate}</h2>
        </div>
        {!isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Game
          </Button>
        )}
      </div>

      {/* Game Info Section */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Opponent
                </label>
                <input
                  type="text"
                  value={editForm.opponent}
                  onChange={e => setEditForm({ ...editForm, opponent: e.target.value })}
                  placeholder="Enter opponent name"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Our Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.homeScore}
                  onChange={e => setEditForm({ ...editForm, homeScore: e.target.value })}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Opponent Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.awayScore}
                  onChange={e => setEditForm({ ...editForm, awayScore: e.target.value })}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Player Attendance */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Players in Attendance
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allPlayers.map(player => (
                  <label
                    key={player.id}
                    className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-blue-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.includes(player.id.toString())}
                      onChange={() => handlePlayerToggle(player.id.toString())}
                      className="rounded"
                    />
                    <span className="text-sm">{player.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save/Cancel buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="positive" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="muted"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    opponent: game.opponent || '',
                    homeScore: game.homeScore?.toString() || '',
                    awayScore: game.awayScore?.toString() || '',
                  });
                  setSelectedPlayerIds(game.players.map(p => p.id.toString()));
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-slate-500">Opponent</span>
              <p className="font-medium text-slate-800">{game.opponent || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Result</span>
              <p className="font-medium text-slate-800">{resultDisplay || 'Not played yet'}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Players</span>
              <p className="font-medium text-slate-800">{game.players.length} in attendance</p>
            </div>
          </div>
        )}
      </div>

      {/* Lineup Table */}
      {game.lineup && (
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Lineup</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 border-b font-semibold text-slate-700">Player</th>
                  {[1, 2, 3, 4].map(inning => (
                    <th key={inning} className="p-2 border-b text-center font-semibold text-slate-700">
                      Inning {inning}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {game.players.map(player => (
                  <tr key={player.id} className="hover:bg-slate-50">
                    <td className="p-2 border-b font-medium text-slate-800">{player.name}</td>
                    {[0, 1, 2, 3].map(inning => {
                      const inningLineup = typeof game.lineup === 'string'
                        ? JSON.parse(game.lineup)
                        : game.lineup;
                      const currentInningLineup = inningLineup[inning];
                      const position = currentInningLineup
                        ? Object.keys(currentInningLineup).find(
                            pos => currentInningLineup[pos] === player.id
                          ) || 'Bench'
                        : 'Bench';

                      return (
                        <td
                          key={`${player.id}-${inning}`}
                          className="p-2 border-b text-center text-slate-600"
                        >
                          {position}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameDetailPage;
