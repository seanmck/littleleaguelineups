import type { Position } from '@lineup/types';

export type PosColor = {
  bg: string;
  text: string;
  border: string;
  dot: string;
  solid: string;
};

const COLORS: Record<Position, PosColor> = {
  P:   { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-300',    dot: 'bg-red-500',    solid: 'bg-red-500' },
  C:   { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-300', dot: 'bg-orange-500', solid: 'bg-orange-500' },
  '1B':{ bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',   dot: 'bg-blue-500',   solid: 'bg-blue-500' },
  '2B':{ bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',   dot: 'bg-blue-500',   solid: 'bg-blue-500' },
  '3B':{ bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',   dot: 'bg-blue-500',   solid: 'bg-blue-500' },
  SS:  { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',   dot: 'bg-blue-500',   solid: 'bg-blue-500' },
  LF:  { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300',  dot: 'bg-green-500',  solid: 'bg-green-500' },
  CF:  { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300',  dot: 'bg-green-500',  solid: 'bg-green-500' },
  RF:  { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300',  dot: 'bg-green-500',  solid: 'bg-green-500' },
  LCF: { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300',  dot: 'bg-green-500',  solid: 'bg-green-500' },
  RCF: { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300',  dot: 'bg-green-500',  solid: 'bg-green-500' },
  Bench:{bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300',  dot: 'bg-slate-400',  solid: 'bg-slate-400' },
};

const FALLBACK: PosColor = COLORS.Bench;

export function getPosColor(pos: string): PosColor {
  return (COLORS as Record<string, PosColor>)[pos] ?? FALLBACK;
}

export const POS_COLORS = COLORS;
