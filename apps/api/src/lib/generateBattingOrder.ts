import { BattingOrderStrategy } from '@lineup/types';

interface PreviousGame {
  battingOrder: number[] | null;
  lastBatterIndex: number | null;
}

function shuffle(arr: number[]): number[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function filterAndAppendNew(previousOrder: number[], currentPlayerIds: number[]): number[] {
  const currentSet = new Set(currentPlayerIds);
  const filtered = previousOrder.filter(id => currentSet.has(id));
  const existingSet = new Set(filtered);
  const newPlayers = shuffle(currentPlayerIds.filter(id => !existingSet.has(id)));
  return [...filtered, ...newPlayers];
}

function rotateOrder(playerIds: number[], previousGames: PreviousGame[]): number[] {
  const prevGame = previousGames.find(g => g.battingOrder != null);
  if (!prevGame || !prevGame.battingOrder) {
    return shuffle(playerIds);
  }
  const prev = prevGame.battingOrder;
  const rotated = [prev[prev.length - 1], ...prev.slice(0, -1)];
  return filterAndAppendNew(rotated, playerIds);
}

function keepSameOrder(playerIds: number[], previousGames: PreviousGame[]): number[] {
  const prevGame = previousGames.find(g => g.battingOrder != null);
  if (!prevGame || !prevGame.battingOrder) {
    return shuffle(playerIds);
  }
  return filterAndAppendNew(prevGame.battingOrder, playerIds);
}

function continueOrder(playerIds: number[], previousGames: PreviousGame[]): number[] {
  const prevGame = previousGames.find(g => g.battingOrder != null);
  if (!prevGame || !prevGame.battingOrder || prevGame.lastBatterIndex == null) {
    // No previous game or last batter not marked — fall back to random
    return shuffle(playerIds);
  }
  const prev = prevGame.battingOrder;
  // Start from the player after the last batter
  const startIndex = (prevGame.lastBatterIndex + 1) % prev.length;
  const reordered = [...prev.slice(startIndex), ...prev.slice(0, startIndex)];
  return filterAndAppendNew(reordered, playerIds);
}

function balancedFairnessOrder(playerIds: number[], previousGames: PreviousGame[]): number[] {
  const positionSums: Record<number, number> = {};
  const positionCounts: Record<number, number> = {};

  for (const game of previousGames) {
    if (!game.battingOrder) continue;
    for (let i = 0; i < game.battingOrder.length; i++) {
      const playerId = game.battingOrder[i];
      positionSums[playerId] = (positionSums[playerId] || 0) + (i + 1);
      positionCounts[playerId] = (positionCounts[playerId] || 0) + 1;
    }
  }

  const withHistory: number[] = [];
  const withoutHistory: number[] = [];

  for (const id of playerIds) {
    if (positionCounts[id]) {
      withHistory.push(id);
    } else {
      withoutHistory.push(id);
    }
  }

  if (withHistory.length === 0) {
    return shuffle(playerIds);
  }

  // Sort: highest average position first (they've batted later, so move them up)
  withHistory.sort((a, b) => {
    const avgA = positionSums[a] / positionCounts[a];
    const avgB = positionSums[b] / positionCounts[b];
    const diff = avgB - avgA;
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  const shuffledNew = shuffle(withoutHistory);
  const midpoint = Math.floor(withHistory.length / 2);
  return [...withHistory.slice(0, midpoint), ...shuffledNew, ...withHistory.slice(midpoint)];
}

export function generateBattingOrder(
  strategy: BattingOrderStrategy,
  playerIds: number[],
  previousGames: PreviousGame[],
): number[] {
  switch (strategy) {
    case 'rotate':
      return rotateOrder(playerIds, previousGames);
    case 'keepSame':
      return keepSameOrder(playerIds, previousGames);
    case 'continue':
      return continueOrder(playerIds, previousGames);
    case 'balancedFairness':
      return balancedFairnessOrder(playerIds, previousGames);
    default:
      return shuffle(playerIds);
  }
}
