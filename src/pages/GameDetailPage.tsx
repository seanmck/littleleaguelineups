import { useParams } from 'react-router-dom';
import { useStore } from '../state/store';
import { useMemo } from 'react';

const POSITIONS = ['P', 'C', '1B', 'SS', '3B', '2B', 'CF', 'LF', 'RF'];

function GameDetailPage() {
  const { gameId } = useParams();
  
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const teams = useStore(state => state.teams);

  const activeTeam = teams.find(t => t.id === selectedTeamId);
  const game = activeTeam?.games.find(g => g.id === gameId);
  const players = activeTeam?.players.filter(p => game?.playerIds.includes(p.id));

  // TEMP: fake lineup generator
  const lineup = useMemo(() => {
    if (!players) return [];

    const playerCount = players.length;
    const innings = 4;

    const assigned: Record<string, (string | null)[]> = {};
    for (const player of players) {
      assigned[player.id] = new Array(innings).fill(null);
    }

    for (let inning = 0; inning < innings; inning++) {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(POSITIONS.length, shuffled.length); i++) {
        const player = shuffled[i];
        // Ensure no repeat positions
        const usedPositions = assigned[player.id].slice(0, inning);
        const available = POSITIONS.find(pos => !usedPositions.includes(pos));
        if (available) assigned[player.id][inning] = available;
      }
    }

    return players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      innings: assigned[player.id],
    }));
  }, [players]);

  if (!game || !players) return <p>Game not found.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6">
      <h2 className="text-xl font-bold">Lineup for {game.date}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 border-b">Player</th>
              {[1, 2, 3, 4].map(inning => (
                <th key={inning} className="p-2 border-b text-center">Inning {inning}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineup.map(player => (
              <tr key={player.playerId}>
                <td className="p-2 border-b font-medium">{player.playerName}</td>
                {player.innings.map((pos, i) => (
                  <td key={i} className="p-2 border-b text-center">{pos ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameDetailPage;
