import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game, calculateGameResult } from '@lineup/types';
import { LoadingState, ErrorBanner, EmptyState, ButtonLink } from '../components/ui';
import { apiFetch } from '../lib/api';

function GamesListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    apiFetch(`/teams/${teamId}/games`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch games');
        return res.json();
      })
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
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

  if (loading) return <LoadingState message="Loading games..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Game Schedule</h2>
        <div className="flex gap-3">
          <ButtonLink variant="primary" to={`/teams/${teamId}/season-recap`}>
            Season Recap
          </ButtonLink>
          <ButtonLink variant="positive" to={`/teams/${teamId}/games/setup`}>
            + New Game
          </ButtonLink>
        </div>
      </div>

      {games.length === 0 ? (
        <EmptyState
          icon="&#128197;"
          message="No games scheduled yet."
          actionLabel="Create First Game"
          actionTo={`/teams/${teamId}/games/setup`}
        />
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
