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
