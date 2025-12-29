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
}

export interface Lineup {
  [inning: number]: {
    [position: string]: number | number[];
  };
}
