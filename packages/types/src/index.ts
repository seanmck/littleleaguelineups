export type Position =
  | 'P'
  | 'C'
  | '1B'
  | '2B'
  | '3B'
  | 'SS'
  | 'LF'
  | 'CF'
  | 'RF'
  | 'LCF'
  | 'RCF'
  | 'Bench';

export const POSITIONS: Position[] = [
  'P',
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'LF',
  'CF',
  'RF',
  'LCF',
  'RCF',
];

export interface Player {
  id: number;
  name: string;
  teamId: number;
  preferredPositions?: String[];
  avoidPositions?: String[];
}

export interface Team {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  date: string;
  teamId: string;
  players: Player[];
  lineup: Record<number, Record<string, string>>;
  notifiedAt?: string;
  opponent?: string;
  homeScore?: number;
  awayScore?: number;
  innings?: number;
}

export type GameResult = 'W' | 'L' | 'T' | null;

export function calculateGameResult(homeScore?: number, awayScore?: number): GameResult {
  if (homeScore === undefined || homeScore === null || awayScore === undefined || awayScore === null) {
    return null;
  }
  if (homeScore > awayScore) return 'W';
  if (homeScore < awayScore) return 'L';
  return 'T';
}

export interface Lineup {
  [inning: number]: {
    [position: string]: number | number[];
  };
}

// Season Recap types

// Player reference with innings count (for charts)
export interface PlayerInningsEntry {
  playerId: number;
  playerName: string;
  innings: number;
}

// Player-level statistics for the season
export interface PlayerSeasonStats {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  gamesAvailable: number;
  totalInnings: number;
  positionCounts: Record<Position, number>;
  benchInnings: number;
  pitchingInnings: number;
  catchingInnings: number;
  infieldInnings: number;
  outfieldInnings: number;
}

// Season summary statistics
export interface SeasonSummary {
  totalGames: number;
  gamesWithScores: number;
  wins: number;
  losses: number;
  ties: number;
  totalInnings: number;
  totalRunsScored: number;
  totalRunsAllowed: number;
}

// Fairness metrics for bench time
export interface BenchTimeEquity {
  average: number;
  stdDev: number;
  min: PlayerInningsEntry;
  max: PlayerInningsEntry;
}

// Fairness metrics for pitching distribution
export interface PitchingDistribution {
  average: number;
  stdDev: number;
  playerList: PlayerInningsEntry[];
}

// Fairness metrics for overall playing time
export interface PlayingTimeDistribution {
  average: number;
  stdDev: number;
  fairnessScore: number;
  min: PlayerInningsEntry;
  max: PlayerInningsEntry;
}

// Combined fairness metrics
export interface FairnessMetrics {
  benchTimeEquity: BenchTimeEquity;
  pitchingDistribution: PitchingDistribution;
  playingTimeDistribution: PlayingTimeDistribution;
}

// Complete season recap response
export interface SeasonRecapStats {
  teamId: number;
  teamName: string;
  seasonSummary: SeasonSummary;
  playerStats: PlayerSeasonStats[];
  fairnessMetrics: FairnessMetrics;
}
