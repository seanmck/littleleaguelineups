import { useParams } from 'react-router-dom';
import { useStore } from '../state/store';
import { useMemo } from 'react';
import { POSITION_POINTS } from '../lib/lineupGenerator';

function GameDetailPage() {
  const { gameId } = useParams();
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const teams = useStore(state => state.teams);

  const activeTeam = teams.find(t => t.id === selectedTeamId);
  const game = activeTeam?.games.find(g => g.id === gameId);
  const players = activeTeam?.players.filter(p => game?.playerIds.includes(p.id));

  function buildPlayerLineup(
    lineup: Record<number, Record<string, string>>,
    players: { id: string; name: string }[]
  ) {
    return players.map(player => {
      const innings = [1, 2, 3, 4].map(inning => {
        const assignments = lineup[inning] ?? {};
        const position = Object.entries(assignments).find(
          ([_, pid]) => pid === player.id
        );
        return position?.[0] ?? null;
      });

      const funPoints = innings.reduce(
        (sum, pos) => sum + (pos ? POSITION_POINTS[pos] || 0 : 0),
        0
      );

      return {
        playerId: player.id,
        playerName: player.name,
        innings,
        funPoints,
      };
    });
  }

  const lineup = useMemo(() => {
    if (!players || !game?.lineup) return [];
    return buildPlayerLineup(game.lineup, players);
  }, [game?.lineup, players]);

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
              <th className="p-2 border-b text-center">Fun Points</th>
            </tr>
          </thead>
          <tbody>
            {lineup.map(player => (
              <tr key={player.playerId}>
                <td className="p-2 border-b font-medium">{player.playerName}</td>
                {player.innings.map((pos, i) => (
                  <td key={i} className="p-2 border-b text-center">{pos ?? '-'}</td>
                ))}
                <td className="p-2 border-b text-center font-semibold">{player.funPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameDetailPage;
