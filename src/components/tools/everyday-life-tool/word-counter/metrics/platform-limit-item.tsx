'use client';

import type { PlatformLimit } from '../utils/text-analysis';

import { InsetGroupRow } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

type PlatformLimitItemProps = {
  limit: PlatformLimit;
  currentCount: number;
};

export function PlatformLimitItem({
  limit,
  currentCount,
}: PlatformLimitItemProps) {
  const ratio = limit.maxChars > 0 ? currentCount / limit.maxChars : 0;
  const clampedPercent = Math.min(100, Math.round(ratio * 100));
  const isOver = currentCount > limit.maxChars;
  const isNear = !isOver && ratio >= 0.8;

  const barColor = isOver
    ? 'bg-red-500 dark:bg-red-400'
    : isNear
      ? 'bg-amber-500 dark:bg-amber-400'
      : 'bg-sky-500 dark:bg-sky-400';

  const countColor = isOver
    ? 'text-red-600 dark:text-red-400'
    : isNear
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-slate-600 dark:text-slate-300';

  return (
    <InsetGroupRow className="space-y-1.5 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
            {limit.name}
          </span>
          <Badge variant="neutral" size="xs">
            {limit.category}
          </Badge>
        </div>

        <span
          className={cn(
            'shrink-0 font-mono text-xs font-semibold tabular-nums',
            countColor
          )}
        >
          {currentCount} / {limit.maxChars}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            barColor
          )}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </InsetGroupRow>
  );
}
