import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Game, InningPositions, Position } from '@lineup/types';
import { parseLineup, POSITIONS } from '@lineup/types';
import { LoadingState, ErrorBanner, Button } from '../components/ui';
import { apiFetch } from '../lib/api';
import { formatGameDate } from '../lib/dates';

const PRINT_PAGE_STYLE = `@page { size: letter portrait; margin: 0.5in; }`;

function findPlayerIdInPosition(ip: InningPositions, pos: Position): number | number[] | null {
  const v = ip[pos];
  if (v === undefined) return null;
  return v;
}

function PrintPage() {
  const { teamId, gameId } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !gameId) return;

    apiFetch(`/teams/${teamId}/games/${gameId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game');
        return res.json();
      })
      .then(setGame)
      .catch(() => setError('Failed to load game'));

    apiFetch(`/teams/${teamId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(team => team && setTeamName(team.name || ''))
      .catch(() => {});
  }, [teamId, gameId]);

  useEffect(() => {
    document.body.classList.add('print-card-mode');
    const styleEl = document.createElement('style');
    styleEl.textContent = PRINT_PAGE_STYLE;
    document.head.appendChild(styleEl);
    return () => {
      document.body.classList.remove('print-card-mode');
      styleEl.remove();
    };
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!game) return <LoadingState message="Loading lineup card..." />;

  const lineup = parseLineup(game.lineup);
  if (!lineup) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>This game has no lineup yet.</p>
        <Link
          to={`/teams/${teamId}/games/${gameId}/plan`}
          className="mt-3 inline-block text-green-700 hover:text-green-900 underline"
        >
          ← Back to plan
        </Link>
      </div>
    );
  }

  const inningsCount = game.innings ?? Object.keys(lineup.innings).length ?? 4;
  const inningsArray = Array.from({ length: inningsCount }, (_, i) => i);
  const playerById = new Map(game.players.map(p => [p.id, p]));

  // Determine which positions appear in this lineup (so we don't render empty rows)
  const positionsUsed = new Set<Position>();
  for (const inning of Object.values(lineup.innings)) {
    for (const pos of Object.keys(inning)) {
      if (pos !== 'Bench' && (POSITIONS as readonly string[]).includes(pos)) {
        positionsUsed.add(pos as Position);
      }
    }
  }
  const orderedPositions = POSITIONS.filter(p => positionsUsed.has(p));

  const formattedDate = formatGameDate(game.date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderCell = (pos: Position, inning: number): string => {
    const ip = lineup.innings[inning];
    if (!ip) return '';
    const v = findPlayerIdInPosition(ip, pos);
    if (Array.isArray(v)) {
      return v.map(id => playerById.get(id)?.name ?? '?').join(', ');
    }
    if (typeof v === 'number') {
      return playerById.get(v)?.name ?? '?';
    }
    return '';
  };

  return (
    <>
      {/* On-screen toolbar (hidden in print) */}
      <div className="no-print max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to={`/teams/${teamId}/games/${gameId}/plan`}
          className="text-green-700 hover:text-green-900 text-sm font-semibold transition-colors"
        >
          &larr; Back to plan
        </Link>
        <Button variant="primary" onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>

      {/* The card itself: 8.5x11 portrait at print time */}
      <article
        className="print-card mx-auto bg-white text-slate-900 my-6 shadow-md"
        style={{
          width: '8.5in',
          minHeight: '11in',
          padding: '0.5in',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-3xl tracking-wide leading-tight">
                {teamName || 'Lineup'}
              </div>
              <div className="text-sm font-bold mt-1">
                vs. {game.opponent || '—'}
              </div>
            </div>
            <div className="text-right text-xs font-semibold leading-snug">
              <div className="uppercase tracking-wider text-slate-600">Date</div>
              <div className="text-base">{formattedDate}</div>
            </div>
          </div>
        </header>

        {/* By-position grid */}
        <section className="mb-5">
          <h2 className="font-display text-xl tracking-wide mb-2 border-b border-slate-400 pb-1">
            Field Positions
          </h2>
          <table
            className="w-full border-collapse"
            style={{ fontSize: '11pt', tableLayout: 'fixed' }}
          >
            <thead>
              <tr>
                <th
                  className="text-left border border-slate-400 bg-slate-100 px-2 py-1"
                  style={{ width: '0.7in' }}
                >
                  Pos
                </th>
                {inningsArray.map(i => (
                  <th
                    key={i}
                    className="text-left border border-slate-400 bg-slate-100 px-2 py-1 font-display tracking-wide"
                  >
                    Inning {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderedPositions.map(pos => (
                <tr key={pos}>
                  <td className="border border-slate-400 px-2 py-1 font-bold text-center font-display tracking-wide">
                    {pos}
                  </td>
                  {inningsArray.map(i => (
                    <td
                      key={`${pos}-${i}`}
                      className="border border-slate-400 px-2 py-1 truncate"
                    >
                      {renderCell(pos, i)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Bench row */}
              <tr>
                <td className="border border-slate-400 px-2 py-1 font-bold text-center font-display tracking-wide bg-slate-50">
                  Bench
                </td>
                {inningsArray.map(i => {
                  const ip = lineup.innings[i];
                  const bench = ip && Array.isArray(ip['Bench']) ? (ip['Bench'] as number[]) : [];
                  return (
                    <td
                      key={`bench-${i}`}
                      className="border border-slate-400 px-2 py-1 text-xs bg-slate-50"
                    >
                      {bench.map(id => playerById.get(id)?.name).filter(Boolean).join(', ')}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </section>

        {/* Batting order */}
        <section className="mb-5">
          <h2 className="font-display text-xl tracking-wide mb-2 border-b border-slate-400 pb-1">
            Batting Order
          </h2>
          <ol
            className="grid grid-cols-2 gap-x-6 gap-y-1"
            style={{ fontSize: '11pt' }}
          >
            {lineup.battingOrder.map((pid, idx) => {
              const player = playerById.get(pid);
              return (
                <li
                  key={pid}
                  className="flex items-center gap-2 border-b border-slate-300 py-1"
                >
                  <span className="font-display text-base w-6 text-right">
                    {idx + 1}.
                  </span>
                  <span className="font-bold flex-1 truncate">
                    {player?.name ?? '—'}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Notes + signature footer */}
        <section
          className="mt-auto pt-4 border-t border-slate-400"
          style={{ fontSize: '10pt' }}
        >
          <div className="font-display text-base tracking-wide mb-1">Notes</div>
          <div className="space-y-3">
            <div className="border-b border-slate-400 h-5" />
            <div className="border-b border-slate-400 h-5" />
            <div className="border-b border-slate-400 h-5" />
          </div>
          <div className="flex items-end justify-between mt-6">
            <div>
              <div className="border-b border-slate-700 w-56" />
              <div className="text-xs text-slate-600 mt-1">Coach signature</div>
            </div>
            <div className="font-display text-lg tracking-widest text-slate-700">
              FAIR · BALL
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

export default PrintPage;
