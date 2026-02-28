import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Game, Player, calculateGameResult } from '@lineup/types';
import { LoadingState, ErrorBanner, Button, Input } from '../components/ui';
import { apiFetch } from '../lib/api';

function getPositionBadge(position: string): { bg: string; text: string } {
  if (position === 'P') return { bg: 'bg-red-100', text: 'text-red-800' };
  if (position === 'C') return { bg: 'bg-blue-100', text: 'text-blue-800' };
  if (['1B', '2B', '3B', 'SS'].includes(position)) return { bg: 'bg-green-100', text: 'text-green-800' };
  if (['LF', 'CF', 'RF', 'LCF', 'RCF'].includes(position)) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
  return { bg: 'bg-slate-100', text: 'text-slate-600' }; // Bench
}

function PositionBadge({ position }: { position: string }) {
  const { bg, text } = getPositionBadge(position);
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}>
      {position}
    </span>
  );
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
    <div className="space-y-6">
      {/* Print-only header (hidden on screen) */}
      <div className="print-only hidden">
        <h1 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '4px' }}>
          Lineup — {formattedDate}
        </h1>
        {game.opponent && (
          <p style={{ fontSize: '12pt', marginBottom: '8px' }}>vs. {game.opponent}</p>
        )}
        <hr style={{ marginBottom: '12px' }} />
      </div>

      {/* Header with back link */}
      <div className="flex justify-between items-start no-print">
        <div>
          <Link
            to={`/teams/${teamId}/games`}
            className="text-green-700 hover:text-green-900 text-sm font-semibold mb-2 inline-block transition-colors"
          >
            &larr; Back to Schedule
          </Link>
          <h2 className="text-3xl font-display text-green-900">{formattedDate}</h2>
        </div>
        <div className="flex gap-2">
          {!isEditing && game.lineup && (
            <Button variant="muted" onClick={() => window.print()}>
              Print Lineup
            </Button>
          )}
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Game
            </Button>
          )}
        </div>
      </div>

      {/* Game Info Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 no-print">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Opponent"
                type="text"
                value={editForm.opponent}
                onChange={e => setEditForm({ ...editForm, opponent: e.target.value })}
                placeholder="Enter opponent name"
              />
              <Input
                label="Our Score"
                type="number"
                min={0}
                value={editForm.homeScore}
                onChange={e => setEditForm({ ...editForm, homeScore: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Opponent Score"
                type="number"
                min={0}
                value={editForm.awayScore}
                onChange={e => setEditForm({ ...editForm, awayScore: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Player Attendance */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Players in Attendance
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allPlayers.map(player => (
                  <label
                    key={player.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selectedPlayerIds.includes(player.id.toString())
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.includes(player.id.toString())}
                      onChange={() => handlePlayerToggle(player.id.toString())}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{player.name}</span>
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
              <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Opponent</span>
              <p className="font-semibold text-slate-800 mt-0.5">{game.opponent || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Result</span>
              <p className="font-semibold text-slate-800 mt-0.5">{resultDisplay || 'Not played yet'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Players</span>
              <p className="font-semibold text-slate-800 mt-0.5">{game.players.length} in attendance</p>
            </div>
          </div>
        )}
      </div>

      {/* Lineup Table */}
      {game.lineup && (() => {
        const parsedLineup = typeof game.lineup === 'string' ? JSON.parse(game.lineup) : game.lineup;
        const inningsCount = game.innings ?? Object.keys(parsedLineup).length ?? 4;
        const inningsArray = Array.from({ length: inningsCount }, (_, i) => i);

        return (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 print-flat">
            <h3 className="text-2xl font-display text-green-900 mb-4 no-print">Lineup</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 border-b font-semibold text-slate-700">Player</th>
                    {inningsArray.map(i => (
                      <th key={i} className="p-3 border-b text-center text-sm font-semibold text-slate-700">
                        Inning {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {game.players.map(player => (
                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-b font-semibold text-slate-800">{player.name}</td>
                      {inningsArray.map(inning => {
                        const currentInningLineup = parsedLineup[inning];
                        const position = currentInningLineup
                          ? Object.keys(currentInningLineup).find(
                              pos => currentInningLineup[pos] === player.id
                            ) || 'Bench'
                          : 'Bench';

                        return (
                          <td
                            key={`${player.id}-${inning}`}
                            className="p-3 border-b text-center"
                          >
                            <PositionBadge position={position} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default GameDetailPage;
