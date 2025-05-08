import { Player, Position } from '../types';

export const POSITIONS = ['P', 'C', '1B', 'SS', '3B', '2B', 'CF', 'LF', 'RF'];

export type Lineup = {
  [inning: number]: {
    [position: string]: string; // position => playerId
  };
};

export const POSITION_POINTS: Record<string, number> = {
  P: 3,
  C: 2,
  '1B': 2,
  '2B': 2,
  SS: 2,
  '3B': 2,
  LF: 1,
  CF: 1,
  RF: 1,
  Bench: 0,
};

export function generateLineup(
  players: Player[],
  innings: number,
  seasonPoints: Record<string, number> = {}
): Lineup {
  const lineup: Lineup = {};
  const gamePoints: Record<string, number> = {};
  const history: Record<string, Set<string>> = {};

  players.forEach(p => {
    gamePoints[p.id] = 0;
    history[p.id] = new Set();
  });

  for (let inning = 1; inning <= innings; inning++) {
    const assignments: Record<string, string> = {};
    const used = new Set<string>();

    for (const pos of POSITIONS) {
      const eligible = players.filter(p => {
        return (
          !used.has(p.id) &&
          !p.avoidPositions?.includes(pos) &&
          !history[p.id].has(pos)
        );
      });

      const sorted = eligible.sort((a, b) => {
        const gameDelta = gamePoints[a.id] - gamePoints[b.id];
        if (gameDelta !== 0) return gameDelta;

        const seasonDelta = (seasonPoints[a.id] || 0) - (seasonPoints[b.id] || 0);
        return seasonDelta;
      });

      const chosen = sorted[0];
      if (chosen) {
        assignments[pos] = chosen.id;
        used.add(chosen.id);
        history[chosen.id].add(pos);
        gamePoints[chosen.id] += POSITION_POINTS[pos];
      }
    }

    lineup[inning] = assignments;
  }

  return lineup;
}