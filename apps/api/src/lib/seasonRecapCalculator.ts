import type {
  Position,
  Lineup,
  SeasonRecapStats,
  SeasonSummary,
  PlayerSeasonStats,
  FairnessMetrics,
  PlayerInningsEntry,
} from '@lineup/types';
import { POSITIONS, calculateGameResult } from '@lineup/types';

interface PlayerWithPositions {
  id: number;
  name: string;
  preferredPositions: string[];
  avoidPositions: string[];
}

interface GameWithPlayers {
  id: number;
  date: Date;
  lineup: unknown;
  opponent: string | null;
  homeScore: number | null;
  awayScore: number | null;
  players: PlayerWithPositions[];
}

interface TeamWithGamesAndPlayers {
  id: number;
  name: string;
  games: GameWithPlayers[];
  players: PlayerWithPositions[];
}

const INFIELD_POSITIONS: Position[] = ['1B', '2B', '3B', 'SS'];
const OUTFIELD_POSITIONS: Position[] = ['LF', 'CF', 'RF', 'LCF', 'RCF'];

function initializePositionCounts(): Record<Position, number> {
  const counts: Record<string, number> = {};
  for (const pos of POSITIONS) {
    counts[pos] = 0;
  }
  counts['Bench'] = 0;
  return counts as Record<Position, number>;
}

function parseLineup(lineupJson: unknown): Lineup | null {
  if (!lineupJson) return null;
  if (typeof lineupJson === 'string') {
    try {
      return JSON.parse(lineupJson);
    } catch {
      return null;
    }
  }
  return lineupJson as Lineup;
}

function findPlayerPosition(
  inningPositions: Record<string, number | number[]>,
  playerId: number
): Position | null {
  for (const [pos, ids] of Object.entries(inningPositions)) {
    if (Array.isArray(ids)) {
      if (ids.includes(playerId)) return pos as Position;
    } else if (ids === playerId) {
      return pos as Position;
    }
  }
  return null;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateFairnessScore(values: number[]): number {
  if (values.length === 0) return 100;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg === 0) return 100;
  const stdDev = calculateStdDev(values);
  const coefficientOfVariation = stdDev / avg;
  // Score: 100 = perfectly fair, 0 = very unfair
  // CV of 0 = 100, CV of 1 = 0
  return Math.max(0, Math.round((1 - coefficientOfVariation) * 100));
}

export function calculateSeasonRecapStats(
  team: TeamWithGamesAndPlayers
): SeasonRecapStats {
  // Initialize player stats map
  const playerStatsMap = new Map<number, PlayerSeasonStats>();
  for (const player of team.players) {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      gamesPlayed: 0,
      gamesAvailable: team.games.length,
      totalInnings: 0,
      positionCounts: initializePositionCounts(),
      benchInnings: 0,
      pitchingInnings: 0,
      catchingInnings: 0,
      infieldInnings: 0,
      outfieldInnings: 0,
    });
  }

  // Initialize season summary
  const seasonSummary: SeasonSummary = {
    totalGames: team.games.length,
    gamesWithScores: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    totalInnings: 0,
    totalRunsScored: 0,
    totalRunsAllowed: 0,
  };

  // Process each game
  for (const game of team.games) {
    // Update W/L/T and scoring
    const result = calculateGameResult(game.homeScore ?? undefined, game.awayScore ?? undefined);
    if (result !== null) {
      seasonSummary.gamesWithScores++;
      if (result === 'W') seasonSummary.wins++;
      else if (result === 'L') seasonSummary.losses++;
      else seasonSummary.ties++;
      seasonSummary.totalRunsScored += game.homeScore ?? 0;
      seasonSummary.totalRunsAllowed += game.awayScore ?? 0;
    }

    // Parse lineup
    const lineup = parseLineup(game.lineup);
    if (!lineup) continue;

    // Track players in this game
    const gamePlayerIds = new Set(game.players.map((p) => p.id));
    for (const playerId of gamePlayerIds) {
      const stats = playerStatsMap.get(playerId);
      if (stats) stats.gamesPlayed++;
    }

    // Process each inning
    for (const [inningStr, positions] of Object.entries(lineup)) {
      if (!positions || typeof positions !== 'object') continue;

      seasonSummary.totalInnings++;

      // For each player in this game, find their position
      for (const player of game.players) {
        const stats = playerStatsMap.get(player.id);
        if (!stats) continue;

        const position = findPlayerPosition(
          positions as Record<string, number | number[]>,
          player.id
        );

        if (position) {
          stats.positionCounts[position]++;
          stats.totalInnings++;

          // Update position groups
          if (position === 'P') {
            stats.pitchingInnings++;
          } else if (position === 'C') {
            stats.catchingInnings++;
          } else if (INFIELD_POSITIONS.includes(position)) {
            stats.infieldInnings++;
          } else if (OUTFIELD_POSITIONS.includes(position)) {
            stats.outfieldInnings++;
          } else if (position === 'Bench') {
            stats.benchInnings++;
          }
        }
      }
    }
  }

  // Convert map to array
  const playerStats = Array.from(playerStatsMap.values());

  // Calculate fairness metrics
  const fairnessMetrics = calculateFairnessMetrics(playerStats);

  return {
    teamId: team.id,
    teamName: team.name,
    seasonSummary,
    playerStats,
    fairnessMetrics,
  };
}

function calculateFairnessMetrics(
  playerStats: PlayerSeasonStats[]
): FairnessMetrics {
  // Only consider players who played at least one game
  const activePlayers = playerStats.filter((p) => p.gamesPlayed > 0);

  if (activePlayers.length === 0) {
    return createEmptyFairnessMetrics();
  }

  // Bench time equity
  const benchInnings = activePlayers.map((p) => p.benchInnings);
  const benchAvg =
    benchInnings.reduce((a, b) => a + b, 0) / benchInnings.length;
  const benchStdDev = calculateStdDev(benchInnings);
  const benchSorted = [...activePlayers].sort(
    (a, b) => a.benchInnings - b.benchInnings
  );

  // Pitching distribution
  const pitchingInnings = activePlayers.map((p) => p.pitchingInnings);
  const pitchingAvg =
    pitchingInnings.reduce((a, b) => a + b, 0) / pitchingInnings.length;
  const pitchingStdDev = calculateStdDev(pitchingInnings);
  const pitchingList: PlayerInningsEntry[] = [...activePlayers]
    .sort((a, b) => b.pitchingInnings - a.pitchingInnings)
    .map((p) => ({
      playerId: p.playerId,
      playerName: p.playerName,
      innings: p.pitchingInnings,
    }));

  // Playing time distribution
  const totalInnings = activePlayers.map((p) => p.totalInnings);
  const playingAvg =
    totalInnings.reduce((a, b) => a + b, 0) / totalInnings.length;
  const playingStdDev = calculateStdDev(totalInnings);
  const playingSorted = [...activePlayers].sort(
    (a, b) => a.totalInnings - b.totalInnings
  );

  return {
    benchTimeEquity: {
      average: Math.round(benchAvg * 10) / 10,
      stdDev: Math.round(benchStdDev * 10) / 10,
      min: {
        playerId: benchSorted[0].playerId,
        playerName: benchSorted[0].playerName,
        innings: benchSorted[0].benchInnings,
      },
      max: {
        playerId: benchSorted[benchSorted.length - 1].playerId,
        playerName: benchSorted[benchSorted.length - 1].playerName,
        innings: benchSorted[benchSorted.length - 1].benchInnings,
      },
    },
    pitchingDistribution: {
      average: Math.round(pitchingAvg * 10) / 10,
      stdDev: Math.round(pitchingStdDev * 10) / 10,
      playerList: pitchingList,
    },
    playingTimeDistribution: {
      average: Math.round(playingAvg * 10) / 10,
      stdDev: Math.round(playingStdDev * 10) / 10,
      fairnessScore: calculateFairnessScore(totalInnings),
      min: {
        playerId: playingSorted[0].playerId,
        playerName: playingSorted[0].playerName,
        innings: playingSorted[0].totalInnings,
      },
      max: {
        playerId: playingSorted[playingSorted.length - 1].playerId,
        playerName: playingSorted[playingSorted.length - 1].playerName,
        innings: playingSorted[playingSorted.length - 1].totalInnings,
      },
    },
  };
}

function createEmptyFairnessMetrics(): FairnessMetrics {
  const emptyPlayer: PlayerInningsEntry = {
    playerId: 0,
    playerName: '',
    innings: 0,
  };

  return {
    benchTimeEquity: {
      average: 0,
      stdDev: 0,
      min: emptyPlayer,
      max: emptyPlayer,
    },
    pitchingDistribution: {
      average: 0,
      stdDev: 0,
      playerList: [],
    },
    playingTimeDistribution: {
      average: 0,
      stdDev: 0,
      fairnessScore: 100,
      min: emptyPlayer,
      max: emptyPlayer,
    },
  };
}
