import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function TeamSelectPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/teams`)
      .then(res => res.json())
      .then(setTeams)
      .catch(err => console.error('Failed to load teams:', err));
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    try {
      console.log('Creating team:', newTeamName);
      console.log('API URL:', `${API_BASE}/teams`);

      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim() })
      });

      const created = await res.json();
      setTeams(prev => [...prev, created]);
      setNewTeamName('');
      navigate(`/teams/${created.id}/roster`);
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold">Select a Team</h2>

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
          <button
            onClick={() => selectedTeamId && navigate(`/teams/${selectedTeamId}/roster`)}
            disabled={!selectedTeamId}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go
          </button>
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
        <button
          onClick={handleCreateTeam}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Team
        </button>
      </div>
    </div>
  );
}

export default TeamSelectPage;
