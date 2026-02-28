import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { SeasonRecapStats, PlayerSeasonStats } from '@lineup/types';
import { LoadingState, ErrorBanner } from '../components/ui';
import { apiFetch } from '../lib/api';

function SeasonRecapPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [stats, setStats] = useState<SeasonRecapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof PlayerSeasonStats>('playerName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!teamId) return;

    apiFetch(`/teams/${teamId}/season-recap`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch season recap');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load season recap');
        setLoading(false);
      });
  }, [teamId]);

  const handleSort = (field: keyof PlayerSeasonStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedPlayers = (): PlayerSeasonStats[] => {
    if (!stats) return [];
    return [...stats.playerStats].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  };

  if (loading) return <LoadingState message="Loading season recap..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!stats) return <ErrorBanner message="No data available." />;

  const { seasonSummary, fairnessMetrics, playerStats } = stats;

  // Prepare chart data
  const pitchingData = fairnessMetrics.pitchingDistribution.playerList
    .filter(p => p.innings > 0)
    .map(p => ({
      name: p.playerName,
      innings: p.innings,
    }));

  const benchData = [...playerStats]
    .filter(p => p.gamesPlayed > 0)
    .sort((a, b) => b.benchInnings - a.benchInnings)
    .map(p => ({
      name: p.playerName,
      benchInnings: p.benchInnings,
    }));

  const positionData = playerStats
    .filter(p => p.gamesPlayed > 0)
    .map(p => ({
      name: p.playerName,
      P: p.pitchingInnings,
      C: p.catchingInnings,
      IF: p.infieldInnings,
      OF: p.outfieldInnings,
      Bench: p.benchInnings,
    }));

  const getFairnessColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-800">Season Recap</h2>
          <p className="text-slate-600">{stats.teamName}</p>
        </div>
        <Link
          to={`/teams/${teamId}/games`}
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Games
        </Link>
      </div>

      {/* Empty State */}
      {seasonSummary.totalGames === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">No games played yet this season.</p>
          <Link
            to={`/teams/${teamId}/games/setup`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Create Your First Game
          </Link>
        </div>
      ) : (
        <>
          {/* Season Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Games Played" value={seasonSummary.totalGames} />
            <StatCard
              label="Record"
              value={`${seasonSummary.wins}-${seasonSummary.losses}-${seasonSummary.ties}`}
            />
            <StatCard label="Runs Scored" value={seasonSummary.totalRunsScored} />
            <StatCard label="Runs Allowed" value={seasonSummary.totalRunsAllowed} />
          </div>

          {/* Fairness Score */}
          <div className="flex justify-center">
            <div
              className={`p-8 rounded-xl ${getFairnessColor(
                fairnessMetrics.playingTimeDistribution.fairnessScore
              )} text-white text-center shadow-lg`}
            >
              <div className="text-5xl font-bold">
                {fairnessMetrics.playingTimeDistribution.fairnessScore}
              </div>
              <div className="text-lg mt-2">Playing Time Fairness Score</div>
              <div className="text-sm opacity-80 mt-1">
                Higher is more equitable (0-100)
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pitching Distribution */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                Pitching Distribution
              </h3>
              {pitchingData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pitching data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pitchingData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="innings" fill="#3b82f6" name="Innings Pitched" />
                    <ReferenceLine
                      x={fairnessMetrics.pitchingDistribution.average}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{ value: 'Avg', fill: '#ef4444', position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bench Time */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                Bench Time Distribution
              </h3>
              {benchData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bench data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={benchData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="benchInnings" fill="#f59e0b" name="Bench Innings" />
                    <ReferenceLine
                      x={fairnessMetrics.benchTimeEquity.average}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{ value: 'Avg', fill: '#10b981', position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Position Distribution Stacked Bar */}
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              Position Distribution by Player
            </h3>
            {positionData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No position data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={positionData}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Innings', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="P" stackId="a" fill="#ef4444" name="Pitcher" />
                  <Bar dataKey="C" stackId="a" fill="#3b82f6" name="Catcher" />
                  <Bar dataKey="IF" stackId="a" fill="#10b981" name="Infield" />
                  <Bar dataKey="OF" stackId="a" fill="#f59e0b" name="Outfield" />
                  <Bar dataKey="Bench" stackId="a" fill="#6b7280" name="Bench" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Detailed Stats Table */}
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              Detailed Player Stats
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <SortableHeader
                      label="Player"
                      field="playerName"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="Games"
                      field="gamesPlayed"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="Innings"
                      field="totalInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="P"
                      field="pitchingInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="C"
                      field="catchingInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="IF"
                      field="infieldInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="OF"
                      field="outfieldInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                    <SortableHeader
                      label="Bench"
                      field="benchInnings"
                      currentField={sortField}
                      direction={sortDirection}
                      onClick={handleSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {getSortedPlayers().map(player => (
                    <tr
                      key={player.playerId}
                      className="hover:bg-blue-50 border-b transition-colors"
                    >
                      <td className="p-3 font-medium text-slate-800">
                        {player.playerName}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.gamesPlayed}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.totalInnings}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.pitchingInnings}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.catchingInnings}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.infieldInnings}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.outfieldInnings}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {player.benchInnings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Simple stat card component
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-blue-800">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}

// Sortable table header component
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
}: {
  label: string;
  field: keyof PlayerSeasonStats;
  currentField: keyof PlayerSeasonStats;
  direction: 'asc' | 'desc';
  onClick: (field: keyof PlayerSeasonStats) => void;
}) {
  const isActive = currentField === field;
  return (
    <th
      className="p-3 text-center border-b font-semibold text-slate-700 cursor-pointer hover:bg-slate-200"
      onClick={() => onClick(field)}
    >
      {label}
      {isActive && (
        <span className="ml-1">{direction === 'asc' ? '▲' : '▼'}</span>
      )}
    </th>
  );
}

export default SeasonRecapPage;
