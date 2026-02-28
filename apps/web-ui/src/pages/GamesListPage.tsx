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

  const getResultBadge = (game: Game) => {
    const result = calculateGameResult(game.homeScore, game.awayScore);
    if (!result) return <span className="text-slate-400">-</span>;
    const styles = {
      W: 'bg-green-100 text-green-800',
      L: 'bg-red-100 text-red-800',
      T: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${styles[result]}`}>
        {formatResult(game)}
      </span>
    );
  };

  if (loading) return <LoadingState message="Loading games..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display text-green-900">Game Schedule</h2>
        <div className="flex gap-3">
          <ButtonLink variant="muted" to={`/teams/${teamId}/season-recap`}>
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-left border-b font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="p-3 text-left border-b font-semibold text-slate-500 text-xs uppercase tracking-wide">Opponent</th>
                  <th className="p-3 text-center border-b font-semibold text-slate-500 text-xs uppercase tracking-wide">Players</th>
                  <th className="p-3 text-center border-b font-semibold text-slate-500 text-xs uppercase tracking-wide">Result</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr
                    key={game.id}
                    onClick={() => navigate(`/teams/${teamId}/games/${game.id}`)}
                    className="hover:bg-green-50 cursor-pointer border-b border-slate-50 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-800">{formatDate(game.date)}</td>
                    <td className="p-3 text-slate-600">{game.opponent || '-'}</td>
                    <td className="p-3 text-center text-slate-600">{game.players?.length || 0}</td>
                    <td className="p-3 text-center">{getResultBadge(game)}</td>
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

export default GamesListPage;
