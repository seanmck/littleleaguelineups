import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Game, Player } from '@lineup/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function GameDetailPage() {
  const { gameId, teamId } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

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

  // Format the date to a user-friendly, locale-specific format
  const formattedDate = new Date(game.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6">
      <h2 className="text-xl font-bold">Lineup for {formattedDate}</h2>
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
                {[0, 1, 2, 3].map(inning => (
                  <td key={`${player.id}-${inning}`} className="p-2 border-b text-center">
                    {(() => {
                      // Parse the lineup if it's a string
                      const inningLineup = typeof game.lineup === 'string'
                        ? JSON.parse(game.lineup)
                        : game.lineup;

                      // Get the lineup for the current inning
                      const currentInningLineup = inningLineup[inning];

                      if (!currentInningLineup) {
                        return '-'; // If no lineup exists for the inning, display "-"
                      }

                      // Find the player's position in the current inning
                      const position = Object.keys(currentInningLineup).find(
                        pos => currentInningLineup[pos] === player.id
                      );

                      return position ? position : '-'; // Display the position or "-"
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
