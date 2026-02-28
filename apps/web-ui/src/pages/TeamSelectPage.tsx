import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '../types';
import { LoadingState, ErrorBanner, Button, Input, Select } from '../components/ui';
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
    <div className="max-w-lg mx-auto mt-12 space-y-6 px-6 page-enter">
      <h2 className="text-3xl font-display text-green-900 text-center">Your Teams</h2>
      {error && <ErrorBanner message={error} />}

      {teams.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <Select
            label="Select a Team"
            value={selectedTeamId || ''}
            onChange={e => setSelectedTeamId(e.target.value)}
          >
            <option value="" disabled>
              Choose a team...
            </option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <Button
            variant="primary"
            onClick={() => selectedTeamId && navigate(`/teams/${selectedTeamId}/roster`)}
            disabled={!selectedTeamId}
          >
            Go to Team
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-display text-xl text-slate-800">Create New Team</h3>
        <Input
          type="text"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreateTeam();
          }}
          placeholder="Team name"
        />
        <Button variant="positive" onClick={handleCreateTeam}>
          Create Team
        </Button>
      </div>
    </div>
  );
}

export default TeamSelectPage;
