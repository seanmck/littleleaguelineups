import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Game, Player, Lineup, InningPositions, calculateGameResult, BATTING_ORDER_STRATEGIES, parseLineup, generateLineup } from '@lineup/types';
import { LoadingState, ErrorBanner, Button, Input } from '../components/ui';
import { PosBadge } from '../components/gameday';
import { apiFetch } from '../lib/api';
import { formatGameDate, toDateInputValue } from '../lib/dates';

function findPlayerPosition(inningPositions: InningPositions, playerId: number): string {
  for (const [pos, value] of Object.entries(inningPositions)) {
    if (Array.isArray(value)) {
      if (value.includes(playerId)) return pos;
    } else if (value === playerId) {
      return pos;
    }
  }
  return 'Bench';
}

function removePlayerFromLineup(lineup: Lineup, playerId: number, allPlayers: Player[], inningsCount: number): Lineup {
  const newBattingOrder = lineup.battingOrder.filter(id => id !== playerId);
  const remainingPlayers = allPlayers.filter(p => newBattingOrder.includes(p.id));
  return generateLineup(remainingPlayers, inningsCount, newBattingOrder);
}

function swapPositions(lineup: Lineup, inning: number, playerA: number, playerB: number): Lineup {
  const newLineup: Lineup = JSON.parse(JSON.stringify(lineup));
  const ip = newLineup.innings[inning];
  if (!ip) return newLineup;

  const posA = findPlayerPosition(ip, playerA);
  const posB = findPlayerPosition(ip, playerB);

  if (posA === posB) return newLineup;

  if (posA !== 'Bench' && posB !== 'Bench') {
    ip[posA] = playerB;
    ip[posB] = playerA;
  } else if (posA !== 'Bench' && posB === 'Bench') {
    ip[posA] = playerB;
    const benchArr = Array.isArray(ip['Bench']) ? ip['Bench'] as number[] : [];
    const idx = benchArr.indexOf(playerB);
    if (idx !== -1) benchArr[idx] = playerA;
    else benchArr.push(playerA);
    ip['Bench'] = benchArr;
  } else if (posA === 'Bench' && posB !== 'Bench') {
    ip[posB] = playerA;
    const benchArr = Array.isArray(ip['Bench']) ? ip['Bench'] as number[] : [];
    const idx = benchArr.indexOf(playerA);
    if (idx !== -1) benchArr[idx] = playerB;
    else benchArr.push(playerB);
    ip['Bench'] = benchArr;
  }

  return newLineup;
}

function PlanPage() {
  const { gameId, teamId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    opponent: '',
    homeScore: '',
    awayScore: '',
  });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isEditingLineup, setIsEditingLineup] = useState(false);
  const [editableLineup, setEditableLineup] = useState<Lineup | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ playerId: number; inning: number } | null>(null);
  const [removedPlayerIds, setRemovedPlayerIds] = useState<Set<number>>(new Set());

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
          date: toDateInputValue(data.date),
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
      date: editForm.date,
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

  const handleStartEditingLineup = () => {
    const parsed = parseLineup(game?.lineup);
    if (!parsed) return;
    setEditableLineup(JSON.parse(JSON.stringify(parsed)));
    setIsEditingLineup(true);
    setSelectedCell(null);
    setRemovedPlayerIds(new Set());
  };

  const handleCancelLineupEdit = () => {
    setEditableLineup(null);
    setIsEditingLineup(false);
    setSelectedCell(null);
    setRemovedPlayerIds(new Set());
  };

  const handleSaveLineup = async () => {
    if (!teamId || !gameId || !editableLineup || !game) return;
    setIsSaving(true);
    const updateData: { lineup: Lineup; playerIds?: string[] } = { lineup: editableLineup };
    if (removedPlayerIds.size > 0) {
      updateData.playerIds = game.players
        .filter(p => !removedPlayerIds.has(p.id))
        .map(p => p.id.toString());
    }
    try {
      const res = await apiFetch(`/teams/${teamId}/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        const updated = await res.json();
        setGame(updated);
        setIsEditingLineup(false);
        setEditableLineup(null);
        setSelectedCell(null);
        setRemovedPlayerIds(new Set());
      } else {
        setError('Failed to save lineup changes');
      }
    } catch {
      setError('Failed to save lineup changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellClick = (playerId: number, inning: number) => {
    if (!isEditingLineup || !editableLineup) return;
    if (!selectedCell) {
      setSelectedCell({ playerId, inning });
    } else if (selectedCell.playerId === playerId && selectedCell.inning === inning) {
      setSelectedCell(null);
    } else if (selectedCell.inning !== inning) {
      setSelectedCell({ playerId, inning });
    } else {
      const newLineup = swapPositions(editableLineup, inning, selectedCell.playerId, playerId);
      setEditableLineup(newLineup);
      setSelectedCell(null);
    }
  };

  const handleBattingReorder = (newOrder: number[]) => {
    if (!editableLineup) return;
    setEditableLineup({ ...editableLineup, battingOrder: newOrder });
  };

  const handleMarkLastBatter = (idx: number) => {
    if (isEditingLineup || !teamId || !game) return;
    const newIndex = game.lastBatterIndex === idx ? null : idx;
    setGame({ ...game, lastBatterIndex: newIndex });
    apiFetch(`/teams/${teamId}/games/${game.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastBatterIndex: newIndex }),
    }).catch(() => {
      setGame({ ...game, lastBatterIndex: game.lastBatterIndex });
    });
  };

  const handleMoveUp = (idx: number) => {
    if (!editableLineup || idx === 0) return;
    const newOrder = [...editableLineup.battingOrder];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    handleBattingReorder(newOrder);
  };

  const handleMoveDown = (idx: number) => {
    if (!editableLineup || idx === editableLineup.battingOrder.length - 1) return;
    const newOrder = [...editableLineup.battingOrder];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    handleBattingReorder(newOrder);
  };

  const handleRemovePlayer = (playerId: number) => {
    if (!editableLineup || !game) return;
    const inningsCount = game.innings ?? Object.keys(editableLineup.innings).length ?? 4;
    setEditableLineup(removePlayerFromLineup(editableLineup, playerId, game.players, inningsCount));
    setRemovedPlayerIds(prev => new Set(prev).add(playerId));
    if (selectedCell?.playerId === playerId) setSelectedCell(null);
  };

  if (error) return <ErrorBanner message={error} />;
  if (!game) return <LoadingState message="Loading game details..." />;

  const formattedDate = formatGameDate(game.date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const result = calculateGameResult(game.homeScore, game.awayScore);
  const resultDisplay = result
    ? `${result === 'W' ? 'Won' : result === 'L' ? 'Lost' : 'Tied'} ${game.homeScore}-${game.awayScore}`
    : null;

  const liveInProgress =
    game.currentInning !== undefined && game.currentInning !== null;
  const hasLineup = !!game.lineup;

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <Link
            to={`/teams/${teamId}/games`}
            className="text-green-700 hover:text-green-900 text-sm font-semibold mb-2 inline-block transition-colors"
          >
            &larr; Back to Schedule
          </Link>
          <h2 className="text-3xl font-display text-green-900">{formattedDate}</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isEditingLineup ? (
            <>
              <Button variant="positive" onClick={handleSaveLineup} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Lineup'}
              </Button>
              <Button variant="muted" onClick={handleCancelLineupEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {!isEditing && hasLineup && (
                <Button
                  variant="muted"
                  onClick={() => navigate(`/teams/${teamId}/games/${gameId}/print`)}
                >
                  Print Card
                </Button>
              )}
              {!isEditing && hasLineup && (
                <Button variant="muted" onClick={handleStartEditingLineup}>
                  Edit Lineup
                </Button>
              )}
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Game
                </Button>
              )}
              {!isEditing && hasLineup && (
                <button
                  type="button"
                  onClick={() => navigate(`/teams/${teamId}/games/${gameId}/live`)}
                  className="rounded-lg px-5 py-2 font-display text-lg tracking-wider bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  ▶ {liveInProgress ? 'Resume Game' : 'Start Game'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {liveInProgress && !isEditing && !isEditingLineup && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center justify-between gap-3">
          <span>
            <span className="font-bold">Game in progress</span> — currently in inning{' '}
            {(game.currentInning ?? 0) + 1}.
          </span>
          <Link
            to={`/teams/${teamId}/games/${gameId}/live`}
            className="font-bold underline hover:no-underline"
          >
            Resume →
          </Link>
        </div>
      )}

      {/* Game Info Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Game Date"
                type="date"
                value={editForm.date}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
              />
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
                    date: toDateInputValue(game.date),
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

      {/* Unified Lineup Table */}
      {game.lineup && (() => {
        const parsed = parseLineup(game.lineup);
        if (!parsed) return null;

        const activeLineup = isEditingLineup && editableLineup ? editableLineup : parsed;
        const inningsCount = game.innings ?? Object.keys(activeLineup.innings).length ?? 4;
        const inningsArray = Array.from({ length: inningsCount }, (_, i) => i);
        const order = activeLineup.battingOrder;
        const strategyLabel = BATTING_ORDER_STRATEGIES.find(
          s => s.value === game.battingOrderStrategy
        )?.label;

        return (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-display text-green-900">Lineup</h3>
              {strategyLabel && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  {strategyLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {isEditingLineup
                ? 'Tap two players in the same inning to swap positions. Use arrows to reorder batting.'
                : 'Tap a player to mark them as the last batter for this game.'}
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 border-b text-center text-sm font-semibold text-slate-700 w-12">#</th>
                    <th className="p-3 border-b font-semibold text-slate-700 w-40">Player</th>
                    {inningsArray.map(i => (
                      <th key={i} className="p-3 border-b text-center text-sm font-semibold text-slate-700 w-20">
                        Inning {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.map((playerId, idx) => {
                    const player = game.players.find(p => p.id === playerId);
                    if (!player) return null;
                    const isLastBatter = game.lastBatterIndex === idx;

                    return (
                      <tr
                        key={playerId}
                        className={`transition-colors ${
                          isLastBatter && !isEditingLineup ? 'bg-amber-50' : ''
                        } ${
                          !isEditingLineup ? 'hover:bg-slate-50 cursor-pointer' : ''
                        }`}
                        onClick={() => !isEditingLineup && handleMarkLastBatter(idx)}
                      >
                        <td className="p-3 border-b text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isEditingLineup && (
                              <span className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                                  disabled={idx === 0}
                                  className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-green-700 hover:bg-green-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 text-xs transition-colors"
                                  aria-label="Move up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                                  disabled={idx === order.length - 1}
                                  className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-green-700 hover:bg-green-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 text-xs transition-colors"
                                  aria-label="Move down"
                                >
                                  ▼
                                </button>
                              </span>
                            )}
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                              isLastBatter && !isEditingLineup ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 border-b font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{player.name}</span>
                            {isLastBatter && !isEditingLineup && (
                              <span className="text-xs font-semibold text-amber-700">
                                Last batter
                              </span>
                            )}
                            {isEditingLineup && order.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemovePlayer(player.id); }}
                                className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors"
                                aria-label={`Remove ${player.name}`}
                                title={`Remove ${player.name}`}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </td>
                        {inningsArray.map(inning => {
                          const currentInningPositions = activeLineup.innings[inning];
                          const position = currentInningPositions
                            ? findPlayerPosition(currentInningPositions, player.id)
                            : 'Bench';

                          const isSelected = selectedCell?.playerId === player.id && selectedCell?.inning === inning;
                          const isSwappable = isEditingLineup && selectedCell !== null && selectedCell.inning === inning && selectedCell.playerId !== player.id;

                          return (
                            <td
                              key={`${player.id}-${inning}`}
                              className={`p-3 border-b text-center ${
                                isEditingLineup ? 'cursor-pointer' : ''
                              } ${
                                isSelected ? 'ring-2 ring-green-500 ring-inset bg-green-50' : ''
                              } ${
                                isSwappable ? 'hover:bg-green-50/50' : ''
                              }`}
                              onClick={(e) => {
                                if (isEditingLineup) {
                                  e.stopPropagation();
                                  handleCellClick(player.id, inning);
                                }
                              }}
                            >
                              <PosBadge pos={position} size="sm" />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default PlanPage;
