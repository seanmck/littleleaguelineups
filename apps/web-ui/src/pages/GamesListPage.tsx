import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game, calculateGameResult } from '@lineup/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function GamesListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    fetch(`${API_BASE}/teams/${teamId}/games`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch games');
        return res.json();
      })
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading games:', err);
        setError('Failed to load games');
        setLoading(false);
      });
  }, [teamId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatResult = (game: Game): string => {
    const result = calculateGameResult(game.homeScore, game.awayScore);
    if (!result) return '-';
    return `${result} ${game.homeScore}-${game.awayScore}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-7xl mx-auto">
        <p className="text-gray-500">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-7xl mx-auto">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Game Schedule</h2>
        <Link
          to={`/teams/${teamId}/games/setup`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + New Game
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-gray-500">No games scheduled yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left border-b font-semibold text-slate-700">Date</th>
                <th className="p-3 text-left border-b font-semibold text-slate-700">Opponent</th>
                <th className="p-3 text-center border-b font-semibold text-slate-700">Players</th>
                <th className="p-3 text-center border-b font-semibold text-slate-700">Result</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr
                  key={game.id}
                  onClick={() => navigate(`/teams/${teamId}/games/${game.id}`)}
                  className="hover:bg-blue-50 cursor-pointer border-b transition-colors"
                >
                  <td className="p-3 text-slate-800">{formatDate(game.date)}</td>
                  <td className="p-3 text-slate-600">{game.opponent || '-'}</td>
                  <td className="p-3 text-center text-slate-600">{game.players?.length || 0}</td>
                  <td className="p-3 text-center text-slate-600">{formatResult(game)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GamesListPage;
