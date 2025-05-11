import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Game {
  id: string;
  date: string;
  lineup: Record<number, Record<string, string>>;
  players: { id: string; name: string }[];
}

function GameDetailPage() {
  const { gameId, teamId } = useParams();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!teamId || !gameId) return;

    console.log('Fetching game details for:', { teamId, gameId });

    fetch(`/api/teams/${teamId}/games/${gameId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game details');
        return res.json();
      })
      .then(data => {
        console.log('Fetched game data:', data);
        setGame(data);
      })
      .catch(err => console.error('Error fetching game details:', err));
  }, [teamId, gameId]);

  if (!game) return <p>Loading game details...</p>;

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
            {game.players.map(player => (
              <tr key={player.id}>
                <td className="p-2 border-b font-medium">{player.name}</td>
                {[1, 2, 3, 4].map(inning => (
                  <td key={`${player.id}-${inning}`} className="p-2 border-b text-center">
                    {(() => {
                      const position = Object.keys(game.lineup[inning] || {}).find(
                        pos => game.lineup[inning][pos] === player.id
                      );
                      return position ? position : '-'; // Display the position
                    })()}
                  </td>
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
