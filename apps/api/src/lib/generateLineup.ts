import { Player, POSITIONS, Position } from '@lineup/types';

export function generateLineup(players: Player[], innings: number = 4): Lineup {
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

  const lineup: Lineup = {};

  for (let inning = 0; inning < innings; inning++) {
    lineup[inning] = {};
    const shuffled = shuffleArray([...players]);
    let positions: Position[];
    if (players.length >= 10) {
      // Use 10 positions: P, C, 1B, 2B, 3B, SS, LF, LCF, RCF, RF
      positions = [ 
        ...POSITIONS.slice(0, 7), // P, C, 1B, 2B, 3B, SS, LF
        'LCF', 'RCF', 'RF'];
    } else {
      // Use 9 positions: P, C, 1B, 2B, 3B, SS, LF, CF, RF
      positions = POSITIONS.slice(0, 9) as Position[];
    }
    // Assign field positions
    shuffled.slice(0, positions.length).forEach((player, index) => {
      const pos = positions[index];
      lineup[inning][pos] = player.id;
      playerPositionHistory[player.id].push(pos);
    });
    // Assign bench if 11 or more players
    if (players.length >= 11) {
      lineup[inning]['Bench'] = shuffled.slice(positions.length).map(player => player.id) as number[];
      shuffled.slice(positions.length).forEach((player) => {
        playerPositionHistory[player.id].push('Bench');
      });
    }
  }

  return lineup;
}

type Lineup = {
  [inning: number]: {
    [position: string]: number | number[]; // allow both single and multiple player IDs
  }
}
