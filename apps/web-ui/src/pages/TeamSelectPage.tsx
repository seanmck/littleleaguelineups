import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '../types';
import { LoadingState, ErrorBanner, Button } from '../components/ui';
import { apiFetch } from '../lib/api';

function TeamSelectPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/teams')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load teams');
        return res.json();
      })
      .then(data => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load teams');
        setLoading(false);
      });
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setError(null);

    try {
      const res = await apiFetch('/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim() })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Failed to create team (${res.status})`);
      }

      const team = await res.json();

      if (!team.id) {
        throw new Error('No team id returned from API');
      }

      navigate(`/teams/${team.id}/roster`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    }
  };

  if (loading) return <LoadingState message="Loading teams..." />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4 w-2/3 mx-auto mt-10">
      <h2 className="text-xl font-bold">Select a Team</h2>
      {error && <ErrorBanner message={error} />}

      {teams.length > 0 && (
        <div className="space-y-2">
          <select
            value={selectedTeamId || ''}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="" disabled>
              Select a team
            </option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={() => selectedTeamId && navigate(`/teams/${selectedTeamId}/roster`)}
            disabled={!selectedTeamId}
            className="mt-2"
          >
            Go
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-300">
        <h3 className="font-semibold mb-2">Create New Team</h3>
        <input
          type="text"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleCreateTeam();
            }
          }}
          placeholder="Team name"
          className="border p-2 rounded w-full"
        />
        <Button variant="positive" onClick={handleCreateTeam} className="mt-2">
          Add Team
        </Button>
      </div>
    </div>
  );
}

export default TeamSelectPage;
