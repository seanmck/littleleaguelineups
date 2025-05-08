import { Player, Position } from '../types';

export const POSITIONS = ['P', 'C', '1B', 'SS', '3B', '2B', 'CF', 'LF', 'RF'];

export type Lineup = {
  [inning: number]: {
    [position: string]: string; // position => playerId
  };
};

export function generateLineup(players: Player[], innings: number): Lineup {
    const lineup: Lineup = {};
    const history: Record<string, Set<string>> = {};
  
    players.forEach(player => {
      history[player.id] = new Set();
    });
  
    for (let inning = 1; inning <= innings; inning++) {
      const assignments: Record<string, string> = {};
      const availablePlayers = [...players].sort(() => Math.random() - 0.5);
      const used = new Set<string>();
  
    

      for (const position of POSITIONS) {        
        // Priority order:
        // 1. Player prefers this position
        // 2. Player does not avoid it
        const eligible = availablePlayers.find(p => {
          const alreadyUsed = used.has(p.id);
          const avoided = p.avoidPositions?.includes(position as Position);
          const alreadyPlayed = history[p.id].has(position);
          return !alreadyUsed && !avoided && !alreadyPlayed;
        });
  
        // Prefer preferred players among eligible
        const preferred = availablePlayers.find(p => {
          const alreadyUsed = used.has(p.id);
          const isPreferred = p.preferredPositions?.includes(position as Position);
          const avoided = p.avoidPositions?.includes(position as Position);
          const alreadyPlayed = history[p.id].has(position as Position);
          return (
            !alreadyUsed && isPreferred && !avoided && !alreadyPlayed
          );
        });
  
        const selected = preferred || eligible;
  
        if (selected) {
          assignments[position] = selected.id;
          used.add(selected.id);
          history[selected.id].add(position);
        }
      }
  
      lineup[inning] = assignments;
    }
  
    return lineup;
  }