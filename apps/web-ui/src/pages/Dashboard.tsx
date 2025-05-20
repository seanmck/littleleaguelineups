// pages/Dashboard.tsx
import React from 'react';
import Card from '../components/Card';
import SubscribeForm from '../components/SubscribeForm';

export default function Dashboard() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          image="/assets/LittleLeagueCoach.png"
          title="Player Roster"
          description="Manage your team’s roster"
          buttonLabel="View Roster"
          linkTo="/teams/1/roster"
        />
        <Card
          image="/assets/LittleLeagueScoresheet.png"
          title="Lineup Strategy"
          description="Set your team’s lineup for games."
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
