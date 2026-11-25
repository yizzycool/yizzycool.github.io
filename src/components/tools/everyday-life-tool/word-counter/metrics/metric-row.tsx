'use client';

import type { LucideIcon } from 'lucide-react';

import { InsetGroupRow } from '@/components/tools/common/inset-group';
import { cn } from '@/utils/cn';

type MetricRowProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
};

export default function MetricRow({
  label,
  value,
  icon: Icon,
}: MetricRowProps) {
  return (
    <InsetGroupRow className="flex items-center justify-between gap-3 px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
            'bg-neutral-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300'
          )}
        >
          <Icon size={14} />
        </div>
        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      </div>

      <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {value}
      </span>
    </InsetGroupRow>
  );
}
