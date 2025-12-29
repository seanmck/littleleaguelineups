// pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import SubscribeForm from '../components/SubscribeForm';
import { Team } from '@lineup/types';

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/my-teams', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(setTeams)
      .catch(err => {
        console.error('Failed to fetch teams', err);
        setTeams([]); // fallback to show UI anyway
      });
  }, []);

  if (teams === null) return <p>Loading...</p>;

  if (teams.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="mb-6">You don't have any teams yet.</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/teams')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Create a Team
          </button>
          <button
            onClick={() => navigate('/teams/join')}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
          >
            🔑 Join a Team
          </button>
        </div>
      </div>
    );
  }

  return (    
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          image="/assets/LittleLeagueCoach.png"
          title="Player Roster"
          description="Manage your team's roster"
          buttonLabel="View Roster"
          linkTo="/teams/1/roster"
        />
        <Card
          image="/assets/LittleLeagueScoresheet.png"
          title="Lineup Strategy"
          description="Set your team's lineup for games."
          buttonLabel="Set Lineup"
          linkTo="/teams/1/roster"
        />
        <Card
          image="/assets/SeasonRecap.png"
          title="Season Recap"
          description="See who has been where so far."
          buttonLabel="Set Recap"
          linkTo="/teams/1/roster"
        />
      </section>

      <SubscribeForm />
    </main>
  );
}
