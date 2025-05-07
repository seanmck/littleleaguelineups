import { useState } from 'react';
import { useStore } from '../state/store';

function TeamSelectPage() {
  const { teams, addTeam, selectTeam } = useStore();
  const [newTeamName, setNewTeamName] = useState('');

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold">Select a Team</h2>
      {teams.length > 0 && (
        <ul className="space-y-2">
          {teams.map(team => (
            <li key={team.id}>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => selectTeam(team.id)}
              >
                {team.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="pt-4 border-t border-slate-300">
        <h3 className="font-semibold mb-2">Create New Team</h3>
        <input
          type="text"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
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
