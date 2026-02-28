import { useParams, Outlet, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Team } from '../types';
import { LoadingState, ErrorBanner } from '../components/ui';
import { apiFetch } from '../lib/api';

function TeamLayout() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    apiFetch(`/teams/${teamId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load team');
        return res.json();
      })
      .then(setTeam)
      .catch(() => setError('Failed to load team'));
  }, [teamId]);

  if (!teamId) return <ErrorBanner message="Team ID not found in URL." />;
  if (error) return <ErrorBanner message={error} />;
  if (!team) return <LoadingState message="Loading team..." />;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-green-700 text-white shadow-sm'
        : 'text-green-200 hover:bg-green-700/50 hover:text-white'
    }`;

  return (
    <div>
      <div className="bg-green-800 border-t border-green-700/50">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-4 overflow-x-auto">
          <span className="text-green-300 text-xs uppercase tracking-wider font-semibold shrink-0">{team.name}</span>
          <span className="text-green-600">|</span>
          <nav className="flex gap-1">
            <NavLink to={`/teams/${teamId}/roster`} className={linkClass}>Roster</NavLink>
            <NavLink to={`/teams/${teamId}/games/setup`} className={linkClass}>Game Setup</NavLink>
            <NavLink to={`/teams/${teamId}/games`} className={linkClass} end>Schedule</NavLink>
            <NavLink to={`/teams/${teamId}/season-recap`} className={linkClass}>Season Recap</NavLink>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default TeamLayout;
