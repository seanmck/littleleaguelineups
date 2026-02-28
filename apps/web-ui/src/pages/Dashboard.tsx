import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { LoadingState, EmptyState, ButtonLink } from '../components/ui';
import { Team, Game, Player } from '@lineup/types';
import { apiFetch } from '../lib/api';

interface TeamStats {
  playerCount: number;
  gameCount: number;
  wins: number;
  losses: number;
  ties: number;
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    apiFetch('/my-teams')
      .then(res => res.json())
      .then((data: Team[]) => {
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      })
      .catch(() => {
        setTeams([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;
    setStats(null);

    Promise.all([
      apiFetch(`/teams/${selectedTeamId}/players`).then(r => r.json()),
      apiFetch(`/teams/${selectedTeamId}/games`).then(r => r.json()),
    ])
      .then(([players, games]: [Player[], Game[]]) => {
        let wins = 0, losses = 0, ties = 0;
        for (const g of games) {
          if (g.homeScore != null && g.awayScore != null) {
            if (g.homeScore > g.awayScore) wins++;
            else if (g.homeScore < g.awayScore) losses++;
            else ties++;
          }
        }
        setStats({
          playerCount: players.length,
          gameCount: games.length,
          wins,
          losses,
          ties,
        });
      })
      .catch(() => {});
  }, [selectedTeamId]);

  if (teams === null) return <LoadingState message="Loading your teams..." />;

  if (teams.length === 0) {
    return (
      <EmptyState
        icon="&#9918;"
        message="Welcome! Create your first team to get started."
        actionLabel="Create a Team"
        actionTo="/teams"
      />
    );
  }

  const team = teams.find(t => t.id === selectedTeamId) ?? teams[0];

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{team.name}</h1>
          {teams.length > 1 && (
            <select
              value={team.id}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="mt-1 text-sm text-slate-500 bg-transparent border-none p-0 cursor-pointer hover:text-slate-700 focus:outline-none"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <ButtonLink variant="muted" to="/teams">
          Manage Teams
        </ButtonLink>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Players" value={stats.playerCount} />
          <StatCard label="Games" value={stats.gameCount} />
          <StatCard
            label="Record"
            value={stats.gameCount > 0 ? `${stats.wins}-${stats.losses}-${stats.ties}` : '--'}
          />
        </div>
      )}

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          image="/assets/LittleLeagueCoach.png"
          title="Player Roster"
          description="Manage your team's roster and position preferences."
          buttonLabel="View Roster"
          linkTo={`/teams/${team.id}/roster`}
        />
        <Card
          image="/assets/LittleLeagueScoresheet.png"
          title="Lineup Strategy"
          description="Set your team's lineup for upcoming games."
          buttonLabel="Set Lineup"
          linkTo={`/teams/${team.id}/games/setup`}
        />
        <Card
          image="/assets/GameSchedule.png"
          title="Schedule"
          description="View your team's schedule and past lineups."
          buttonLabel="View Schedule"
          linkTo={`/teams/${team.id}/games`}
        />
        <Card
          image="/assets/SeasonRecap.png"
          title="Season Recap"
          description="See playing time distribution and fairness stats."
          buttonLabel="View Recap"
          linkTo={`/teams/${team.id}/season-recap`}
        />
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
      <div className="text-2xl font-bold text-blue-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
