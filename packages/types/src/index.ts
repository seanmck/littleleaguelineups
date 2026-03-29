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

export type BattingOrderStrategy = 'rotate' | 'keepSame' | 'continue' | 'balancedFairness';

export const BATTING_ORDER_STRATEGIES: { value: BattingOrderStrategy; label: string; description: string }[] = [
  { value: 'rotate', label: 'Rotate', description: 'Last batter moves to the top of the order each game' },
  { value: 'keepSame', label: 'Keep Same', description: 'Reuse the batting order from the previous game' },
  { value: 'continue', label: 'Continue', description: 'Pick up from where the last game left off' },
  { value: 'balancedFairness', label: 'Balanced Fairness', description: 'Optimize order for season-long fairness' },
];

export interface Team {
  id: string;
  name: string;
  battingOrderStrategy?: BattingOrderStrategy;
}

export interface Game {
  id: string;
  date: string;
  teamId: string;
  players: Player[];
  lineup: Lineup | null;
  notifiedAt?: string;
  opponent?: string;
  homeScore?: number;
  awayScore?: number;
  innings?: number;
  battingOrderStrategy?: BattingOrderStrategy;
  lastBatterIndex?: number | null;
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

export interface InningPositions {
  [position: string]: number | number[];
}

export interface Lineup {
  battingOrder: number[];
  innings: {
    [inning: number]: InningPositions;
  };
}

/** Unwrap a value that may have been double-JSON-stringified by Prisma */
function unwrap(val: unknown): unknown {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

/**
 * Parse a lineup from the database, handling both old format (bare innings map)
 * and new format (with battingOrder + innings wrapper).
 * Handles double-serialized values from JSON.stringify() into Prisma Json columns.
 * For old games without a battingOrder, one is derived from the player IDs in the lineup.
 */
export function parseLineup(raw: unknown): Lineup | null {
  if (!raw) return null;
  const obj = unwrap(raw);
  if (!obj || typeof obj !== 'object') return null;

  // New format: has 'innings' key
  if ('innings' in obj) {
    const battingOrder = unwrap((obj as any).battingOrder);
    const innings = unwrap((obj as any).innings);
    if (!Array.isArray(battingOrder) || !innings || typeof innings !== 'object') return null;
    return { battingOrder, innings: innings as { [inning: number]: InningPositions } };
  }

  // Old format: bare innings map like { "0": { "P": 5, ... }, "1": { ... } }
  const innings = obj as { [inning: number]: InningPositions };
  const playerIds = new Set<number>();
  for (const positions of Object.values(innings)) {
    if (!positions || typeof positions !== 'object') continue;
    for (const val of Object.values(positions)) {
      if (Array.isArray(val)) val.forEach(id => playerIds.add(id));
      else if (typeof val === 'number') playerIds.add(val);
    }
  }
  return {
    battingOrder: Array.from(playerIds),
    innings,
  };
}

// Team membership types

export interface TeamMember {
  id: string;
  accountId: string;
  email: string;
  name?: string;
  role: 'coach' | 'parent';
}

export interface TeamInvitation {
  id: string;
  email: string;
  teamId: number;
  status: 'pending' | 'accepted' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  invitedBy: { email: string };
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
