// src/layouts/TeamLayout.tsx
import { useParams, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Team } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function TeamLayout() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!teamId) return;

    fetch(`${API_BASE}/teams/${teamId}`)
      .then(res => res.json())
      .then(setTeam)
      .catch(err => console.error('Error loading team:', err));
  }, [teamId]);

  if (!teamId) return <p>Team ID not found in URL.</p>;
  if (!team) return <p>Loading team...</p>;

  return (
    <div>
      <header className="w-full bg-blue-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-wider">Little League Lineup</h1>
          <p className="text-sm mt-1">
            Managing team: <span className="font-semibold">{team.name}</span>
          </p>
          <div className="mt-4 space-x-4">
            <Link to={`/teams/${teamId}/roster`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Roster</Link>
            <Link to={`/teams/${teamId}/games/setup`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Game Setup</Link>
            <Link to={`/teams/${teamId}/games`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Game Schedule</Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default TeamLayout;
