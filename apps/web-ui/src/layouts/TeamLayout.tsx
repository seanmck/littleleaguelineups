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
    `px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
    }`;

  return (
    <div>
      <div className="bg-blue-900/80">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-4">
          <span className="text-blue-300 text-xs uppercase tracking-wider">{team.name}</span>
          <span className="text-blue-700">|</span>
          <nav className="flex gap-1">
            <NavLink to={`/teams/${teamId}/roster`} className={linkClass}>Roster</NavLink>
            <NavLink to={`/teams/${teamId}/games/setup`} className={linkClass}>Game Setup</NavLink>
            <NavLink to={`/teams/${teamId}/games`} className={linkClass} end>Schedule</NavLink>
            <NavLink to={`/teams/${teamId}/season-recap`} className={linkClass}>Season Recap</NavLink>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}

export default TeamLayout;
