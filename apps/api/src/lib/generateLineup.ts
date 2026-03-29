import { Player, POSITIONS, Position, Lineup, InningPositions } from '@lineup/types';

export function generateLineup(players: Player[], innings: number = 4, battingOrder: number[]): Lineup {
  const shuffleArray = (array: Player[]): Player[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const playerPositionHistory: Record<string | number, string[]> = players.reduce((acc, player) => {
    acc[player.id] = [];
    return acc;
  }, {} as Record<string | number, string[]>);

  const inningsMap: { [inning: number]: InningPositions } = {};

  for (let inning = 0; inning < innings; inning++) {
    inningsMap[inning] = {};
    const shuffled = shuffleArray([...players]);
    let positions: Position[];
    if (players.length >= 10) {
      positions = [
        ...POSITIONS.slice(0, 7),
        'LCF', 'RCF', 'RF'];
    } else {
      positions = POSITIONS.slice(0, 9) as Position[];
    }
    shuffled.slice(0, positions.length).forEach((player, index) => {
      const pos = positions[index];
      inningsMap[inning][pos] = player.id;
      playerPositionHistory[player.id].push(pos);
    });
    if (players.length >= 11) {
      inningsMap[inning]['Bench'] = shuffled.slice(positions.length).map(player => player.id) as number[];
      shuffled.slice(positions.length).forEach((player) => {
        playerPositionHistory[player.id].push('Bench');
      });
    }
  }

  return {
    battingOrder,
    innings: inningsMap,
  };
}
