import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { generateLineup } from '../lib/lineupGenerator';

function GamesListPage() {
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const teams = useStore(state => state.teams);
  const updateTeam = useStore(state => state.updateTeam);

  const team = teams.find(t => t.id === selectedTeamId);
  if (!team) return <p>No team selected.</p>;

  const now = new Date();
  const games = [...team.games].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingGames = games.filter(g => new Date(g.date) >= now);
  const pastGames = games.filter(g => new Date(g.date) < now);

  const handleGenerateLineup = (gameId: string) => {
    const game = team.games.find(g => g.id === gameId);
    if (!game) return;
    const players = team.players.filter(p => game.playerIds.includes(p.id));
    const lineup = generateLineup(players, 4);
    const updatedGames = team.games.map(g =>
      g.id === gameId ? { ...g, lineup } : g
    );
    updateTeam({ ...team, games: updatedGames });
  };

  const renderGameList = (gameList: typeof games) => (
    <ul className="divide-y divide-slate-200">
      {gameList.map(game => (
        <li key={game.id} className="py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">{game.date}</p>
              <p className="text-sm text-slate-500">
                {game.lineup ? 'Lineup ready' : 'No lineup yet'}
              </p>
            </div>
            <div className="flex gap-2">
              {game.lineup ? (
                <Link
                  to={`/games/${game.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  View Lineup
                </Link>
              ) : (
                <button
                  onClick={() => handleGenerateLineup(game.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Generate Lineup
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      <h2 className="text-3xl font-bold text-blue-800">Games Schedule</h2>

      {upcomingGames.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Upcoming Games</h3>
          {renderGameList(upcomingGames)}
        </section>
      )}

      {pastGames.length > 0 && (
        <section className="pt-6 border-t border-slate-300">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Past Games</h3>
          {renderGameList(pastGames)}
        </section>
      )}
    </div>
  );
}

export default GamesListPage;
