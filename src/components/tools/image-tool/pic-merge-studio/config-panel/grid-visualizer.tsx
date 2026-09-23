'use client';

import { cn } from '@/utils/cn';

export type GridVisualizerProps = {
  rows?: number;
  cols?: number;
  active?: boolean;
  className?: string;
};

export function GridVisualizer({
  rows = 2,
  cols = 2,
  active = true,
  className,
}: GridVisualizerProps) {
  const safeRows = Math.min(Math.max(rows, 1), 6);
  const safeCols = Math.min(Math.max(cols, 1), 6);
  const totalCells = safeRows * safeCols;

  return (
    <div
      title={`Preview: ${rows} × ${cols}`}
      className={cn(
        'relative aspect-square h-[34px] w-[34px] shrink-0 rounded-md border p-0.5 transition-all',
        active
          ? 'border-sky-300 bg-sky-50/50 dark:border-sky-800/70 dark:bg-sky-950/30'
          : 'border-neutral-200/80 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-800/50',
        className
      )}
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${safeRows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
        gap: '1.5px',
      }}
    >
      {Array.from({ length: totalCells }).map((_, idx) => (
        <span
          key={idx}
          className={cn(
            'rounded-[1.5px] transition-colors',
            active
              ? 'bg-sky-500/50 dark:bg-sky-400/40'
              : 'bg-neutral-300/70 dark:bg-neutral-600/60'
          )}
        />
      ))}
    </div>
  );
}

export default GridVisualizer;
