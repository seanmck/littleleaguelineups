import type { Player, Position, InningPositions } from '@lineup/types';
import { getPosColor } from './posColors';
import { truncateName } from './truncateName';

type FieldPosKey = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'LCF' | 'RCF';

type FieldMap = Partial<Record<FieldPosKey, { x: number; y: number }>>;

// All maps share the same viewBox (480 × 460) with home plate at (240, 380).
// Coordinates are chip *centers*; each chip is 108w × 30h, so a few spacing rules:
//   - keep chip x-edges ≥ 8px from viewBox edges (chips span ±54 from center)
//   - keep chip y-edges ≥ 8px from viewBox top/bottom (chips span ±15 from center)
//   - adjacent chips need ≥120px x-gap or ≥35px y-gap to avoid overlap

export const FIELD_POSITIONS_8: FieldMap = {
  P:  { x: 240, y: 290 },
  C:  { x: 240, y: 425 },
  '1B': { x: 340, y: 240 },
  '2B': { x: 320, y: 200 },
  '3B': { x: 140, y: 240 },
  SS:   { x: 160, y: 200 },
  LF:   { x: 110, y: 80 },
  RF:   { x: 370, y: 80 },
};

export const FIELD_POSITIONS_9: FieldMap = {
  P:  { x: 240, y: 290 },
  C:  { x: 240, y: 425 },
  '1B': { x: 340, y: 240 },
  '2B': { x: 320, y: 200 },
  '3B': { x: 140, y: 240 },
  SS:   { x: 160, y: 200 },
  LF:   { x: 80,  y: 100 },
  CF:   { x: 240, y: 55 },
  RF:   { x: 400, y: 100 },
};

export const FIELD_POSITIONS_10: FieldMap = {
  P:  { x: 240, y: 290 },
  C:  { x: 240, y: 425 },
  '1B': { x: 350, y: 240 },
  '2B': { x: 325, y: 200 },
  '3B': { x: 130, y: 240 },
  SS:   { x: 155, y: 200 },
  LF:   { x: 75,  y: 115 },
  LCF:  { x: 175, y: 65 },
  RCF:  { x: 325, y: 65 },
  RF:   { x: 405, y: 115 },
};

function pickMap(positions: Position[]): FieldMap {
  const fieldOnly = positions.filter(p => p !== 'Bench');
  if (fieldOnly.includes('LCF') || fieldOnly.includes('RCF')) return FIELD_POSITIONS_10;
  if (fieldOnly.length <= 8) return FIELD_POSITIONS_8;
  return FIELD_POSITIONS_9;
}

function findPlayerIdAt(inning: InningPositions, pos: string): number | null {
  const v = inning[pos];
  if (typeof v === 'number') return v;
  return null;
}

export interface FieldDiagramProps {
  inning: InningPositions;
  players: Pick<Player, 'id' | 'name'>[];
  positions: Position[];
  highlightPid?: number | null;
  onPlayerTap?: (player: Pick<Player, 'id' | 'name'>, pos: Position) => void;
  size?: number;
  showNames?: boolean;
  chipScale?: number;
}

export function FieldDiagram({
  inning,
  players,
  positions,
  highlightPid,
  onPlayerTap,
  size = 460,
  showNames = true,
  chipScale = 1,
}: FieldDiagramProps) {
  const map = pickMap(positions);
  const chipW = 108 * chipScale;
  const chipH = 30 * chipScale;
  const tagW = 34 * chipScale;
  const playerById = new Map(players.map(p => [p.id, p]));

  return (
    <svg
      viewBox="0 0 480 460"
      width="100%"
      height={size}
      role="img"
      aria-label="Baseball field diagram"
      style={{ maxWidth: '100%', display: 'block' }}
    >
      <defs>
        <pattern id="grassStripes" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#4ade80" />
          <rect width="20" height="40" fill="#22c55e" />
        </pattern>
        <filter id="chipShadow" x="-10%" y="-20%" width="120%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Outfield grass with stripes */}
      <rect x="0" y="0" width="480" height="460" fill="url(#grassStripes)" opacity="0.5" />
      <rect x="0" y="0" width="480" height="460" fill="#86efac" opacity="0.35" />

      {/* Foul lines (from home plate out past the bases) */}
      <line x1="240" y1="380" x2="450" y2="170" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="240" y1="380" x2="30" y2="170" stroke="white" strokeWidth="1.5" opacity="0.6" />

      {/* Infield dirt diamond (rotated square) */}
      <polygon points="240,200 340,300 240,400 140,300" fill="#d4a574" />

      {/* Infield grass inset */}
      <polygon points="240,228 312,300 240,372 168,300" fill="#86efac" />

      {/* Bases */}
      <rect x="234" y="294" width="12" height="12" fill="white" /> {/* 2B-ish marker; actual positions below */}
      {/* Home plate (flat edge faces pitcher, point faces catcher) */}
      <polygon points="232,372 248,372 248,378 240,386 232,378" fill="white" />
      {/* 1B */}
      <rect x="306" y="294" width="12" height="12" fill="white" transform="rotate(45 312 300)" />
      {/* 3B */}
      <rect x="162" y="294" width="12" height="12" fill="white" transform="rotate(45 168 300)" />
      {/* 2B */}
      <rect x="234" y="222" width="12" height="12" fill="white" transform="rotate(45 240 228)" />

      {/* Player chips */}
      {(positions.filter(p => p !== 'Bench') as FieldPosKey[]).map(pos => {
        const coord = map[pos];
        if (!coord) return null;
        const pid = findPlayerIdAt(inning, pos);
        const player = pid != null ? playerById.get(pid) : null;
        const color = getPosColor(pos);
        const isHighlight = pid != null && pid === highlightPid;
        const left = coord.x - chipW / 2;
        const top = coord.y - chipH / 2;
        const tagFill =
          pos === 'P' ? '#ef4444'
          : pos === 'C' ? '#f97316'
          : ['1B','2B','3B','SS'].includes(pos) ? '#3b82f6'
          : '#22c55e';

        return (
          <g
            key={pos}
            transform={`translate(${left}, ${top})`}
            filter="url(#chipShadow)"
            style={{ cursor: onPlayerTap ? 'pointer' : 'default' }}
            onClick={() => {
              if (onPlayerTap && player) onPlayerTap(player, pos as Position);
            }}
          >
            {/* Pill background — single unified shape */}
            <rect
              x="0"
              y="0"
              width={chipW}
              height={chipH}
              rx={chipH / 2}
              ry={chipH / 2}
              fill="white"
              stroke={isHighlight ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isHighlight ? 2.5 : 1}
            />
            {/* Position tag (left segment) */}
            <clipPath id={`clip-${pos}`}>
              <rect x="0" y="0" width={tagW} height={chipH} rx={chipH / 2} ry={chipH / 2} />
            </clipPath>
            <g clipPath={`url(#clip-${pos})`}>
              <rect x="0" y="0" width={tagW + 4} height={chipH} fill={tagFill} />
            </g>
            <text
              x={tagW / 2}
              y={chipH / 2 + 4 * chipScale}
              textAnchor="middle"
              fill="white"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 14 * chipScale,
                letterSpacing: 0.5,
              }}
            >
              {pos}
            </text>
            {/* Player name (right segment) */}
            {showNames && (
              <text
                x={tagW + 8 * chipScale}
                y={chipH / 2 + 4 * chipScale}
                fill={color.text.startsWith('text-') ? '#0f172a' : '#0f172a'}
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 14 * chipScale,
                }}
              >
                {player ? truncateName(player.name, 11) : '—'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default FieldDiagram;
