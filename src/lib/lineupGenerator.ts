export const POSITIONS = ['P', 'C', '1B', 'SS', '3B', '2B', 'CF', 'LF', 'RF'];

export type Lineup = {
  [inning: number]: {
    [position: string]: string; // position => playerId
  };
};

export function generateLineup(players: string[], innings: number): Lineup {
  const lineup: Lineup = {};

  const playerHistory: Record<string, Set<string>> = {};
  for (const player of players) {
    playerHistory[player] = new Set();
  }

  for (let inning = 1; inning <= innings; inning++) {
    const inningAssignments: { [position: string]: string } = {};
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const usedPlayers = new Set<string>();

    for (const position of POSITIONS) {
      const player = shuffledPlayers.find(p =>
        !usedPlayers.has(p) &&
        !playerHistory[p].has(position)
      );

      if (player) {
        inningAssignments[position] = player;
        usedPlayers.add(player);
        playerHistory[player].add(position);
      }
    }

    lineup[inning] = inningAssignments;
  }

  return lineup;
}
