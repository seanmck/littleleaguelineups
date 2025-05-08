import { useState } from 'react';
import { useStore } from '../state/store';
import { POSITIONS } from '../lib/lineupGenerator';
import { Player, Position } from '../types';

function RosterPage() {
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const team = useStore(state =>
    state.teams.find(t => t.id === selectedTeamId)
  );
  const updateTeam = useStore(state => state.updateTeam);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  if (!team) return <p>No team selected.</p>;

  const updatePlayer = (playerId: string, updated: Partial<Player>) => {
    const updatedPlayers = team.players.map(p =>
      p.id === playerId ? { ...p, ...updated } : p
    );
    updateTeam({ ...team, players: updatedPlayers });
  };

  const toggle = (list: Position[] | undefined, pos: Position): Position[] => {
    return list?.includes(pos) ? list.filter(p => p !== pos) : [...(list || []), pos];
  };

  const toggleRole = (list: ('Pitcher' | 'Catcher')[] | undefined, role: 'Pitcher' | 'Catcher') => {
    return list?.includes(role) ? list.filter(r => r !== role) : [...(list || []), role];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-3xl font-bold text-blue-800">Team Roster</h2>
      {team.players.map(player => (
        <div key={player.id} className="border-t border-slate-200 pt-4 pb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-800">{player.name}</span>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setExpandedPlayerId(p => (p === player.id ? null : player.id))}
            >
              {expandedPlayerId === player.id ? 'Hide Preferences' : 'Manage Preferences'}
            </button>
          </div>

          {expandedPlayerId === player.id && (
            <div className="mt-4 space-y-6 bg-slate-50 p-4 rounded">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-700">Preferred Positions</h4>
                <div className="flex flex-wrap gap-3">
                  {POSITIONS.map(pos => (
                    <label key={pos} className="flex items-center gap-1 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={player.preferredPositions?.includes(pos) || false}
                        onChange={() =>
                          updatePlayer(player.id, {
                            preferredPositions: toggle(player.preferredPositions, pos),
                          })
                        }
                      />
                      {pos}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-700">Avoid Positions</h4>
                <div className="flex flex-wrap gap-3">
                  {POSITIONS.map(pos => (
                    <label key={pos} className="flex items-center gap-1 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={player.avoidPositions?.includes(pos) || false}
                        onChange={() =>
                          updatePlayer(player.id, {
                            avoidPositions: toggle(player.avoidPositions, pos),
                          })
                        }
                      />
                      {pos}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-700">Primary Roles</h4>
                <div className="flex gap-4">
                  {(['Pitcher', 'Catcher'] as const).map(role => (
                    <label key={role} className="flex items-center gap-1 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={player.primaryRoles?.includes(role) || false}
                        onChange={() =>
                          updatePlayer(player.id, {
                            primaryRoles: toggleRole(player.primaryRoles, role),
                          })
                        }
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RosterPage;
