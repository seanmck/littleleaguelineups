export type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'Bench';

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
  availablePlayerIds: string[];
}
