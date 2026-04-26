import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game, Lineup } from '@lineup/types';
import { parseLineup } from '@lineup/types';
import { apiFetch } from '../lib/api';

export type LiveGameUpdate = Partial<{
  currentInning: number;
  atBatIdx: number;
  homeScore: number;
  awayScore: number;
  lineup: Lineup;
}>;

/**
 * Manages live game state with optimistic local updates and background persistence.
 * Per PRD §14: last-write-wins, single writer.
 */
export function useLiveGame(teamId: string | undefined, gameId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [lineup, setLineupState] = useState<Lineup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track in-flight updates so we don't lose later writes if an earlier
  // request resolves slowly. Each update triggers a fresh PUT immediately;
  // server is the source of truth on next page load.
  const pendingRef = useRef(0);

  useEffect(() => {
    if (!teamId || !gameId) return;
    let cancelled = false;
    setLoading(true);
    apiFetch(`/teams/${teamId}/games/${gameId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game');
        return res.json();
      })
      .then((data: Game) => {
        if (cancelled) return;
        setGame(data);
        setLineupState(parseLineup(data.lineup));
        setLoading(false);
        // Initialize live state if game has never been started
        if ((data.currentInning === undefined || data.currentInning === null) && data.lineup) {
          persist({ currentInning: 0, atBatIdx: 0 }, data);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load game');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, gameId]);

  const persist = useCallback(
    async (update: LiveGameUpdate, base?: Game) => {
      if (!teamId || !gameId) return;
      const current = base ?? game;
      if (!current) return;

      // Optimistic local update
      const next: Game = { ...current, ...update };
      setGame(next);
      if (update.lineup) setLineupState(update.lineup);

      pendingRef.current++;
      try {
        await apiFetch(`/teams/${teamId}/games/${gameId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
      } catch {
        // Network failed — surface error but keep local state (PRD §14)
        setError('Network error — changes saved locally');
      } finally {
        pendingRef.current--;
      }
    },
    [teamId, gameId, game]
  );

  const setCurrentInning = useCallback(
    (n: number) => persist({ currentInning: Math.max(0, n) }),
    [persist]
  );
  const setAtBatIdx = useCallback(
    (n: number) => persist({ atBatIdx: Math.max(0, n) }),
    [persist]
  );
  const setHomeScore = useCallback(
    (n: number) => persist({ homeScore: Math.max(0, n) }),
    [persist]
  );
  const setAwayScore = useCallback(
    (n: number) => persist({ awayScore: Math.max(0, n) }),
    [persist]
  );
  const setLineup = useCallback(
    (lu: Lineup) => persist({ lineup: lu }),
    [persist]
  );

  return {
    game,
    lineup,
    loading,
    error,
    clearError: () => setError(null),
    setCurrentInning,
    setAtBatIdx,
    setHomeScore,
    setAwayScore,
    setLineup,
  };
}
