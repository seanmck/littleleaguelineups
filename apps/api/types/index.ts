/*
export type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'Bench';

export interface Team {
  id: string;
  name: string;
  players: Player[];
  games: Game[];
}

export interface Player {
  id: string;
  name: string;
  canPlay: Position[];
  preferredPositions?: Position[];
  avoidPositions?: Position[];
  primaryRoles?: ('Pitcher' | 'Catcher')[];
}

export interface Game {
  id: string;
  date: string;
  playerIds: string[];
  lineup?: Lineup; // <-- new optional field
}
*/