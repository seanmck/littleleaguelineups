import { getPosColor } from './posColors';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  xs: 'px-1.5 py-0 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

export function PosBadge({
  pos,
  size = 'sm',
  className = '',
}: {
  pos: string;
  size?: Size;
  className?: string;
}) {
  const { bg, text } = getPosColor(pos);
  return (
    <span
      className={`inline-block rounded-full font-bold tracking-wide ${bg} ${text} ${SIZES[size]} ${className}`}
    >
      {pos}
    </span>
  );
}

export default PosBadge;
