'use client';

import type { LucideIcon } from 'lucide-react';

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
    <div
      className={cn(
        'group flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors',
        'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'rounded-lg p-2 transition-colors',
            'bg-neutral-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300 dark:group-hover:bg-neutral-700'
          )}
        >
          <Icon size={16} />
        </div>
        <span
          className={cn(
            'font-medium tracking-tight transition-colors',
            'text-sm text-slate-800 dark:text-slate-100'
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn(
          'font-mono font-bold tabular-nums',
          'text-base text-slate-900 dark:text-slate-50'
        )}
      >
        {value}
      </span>
    </div>
  );
}
