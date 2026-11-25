'use client';

import type { KeywordDensityItem as KeywordItem } from '../utils/text-analysis';

import { InsetGroupRow } from '@/components/tools/common/inset-group';

type KeywordDensityItemProps = {
  item: KeywordItem;
  rank: number;
  maxCount: number;
};

export function KeywordDensityItem({
  item,
  rank,
  maxCount,
}: KeywordDensityItemProps) {
  const barWidth =
    maxCount > 0 ? Math.max(6, Math.round((item.count / maxCount) * 100)) : 0;

  return (
    <InsetGroupRow className="space-y-1.5 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="w-5 shrink-0 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
            #{rank}
          </span>
          <span className="truncate font-mono font-semibold text-slate-800 dark:text-slate-100">
            {item.term}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular-nums">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {item.count}x
          </span>
          <span className="w-12 text-right text-slate-400 dark:text-slate-500">
            {item.percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-sky-500/80 transition-all duration-300 dark:bg-sky-400/80"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </InsetGroupRow>
  );
}
