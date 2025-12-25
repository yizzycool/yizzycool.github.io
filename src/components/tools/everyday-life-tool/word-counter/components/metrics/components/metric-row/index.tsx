' use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
};

export default function MetricRow({ label, value, icon: Icon }: Props) {
  return (
    <div
      className={clsx(
        'group flex items-center justify-between rounded-xl px-4 py-2.5 transition-all',
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'rounded-lg p-2 transition-colors',
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-neutral-700'
          )}
        >
          <Icon size={16} />
        </div>
        <span
          className={clsx(
            'font-medium tracking-tight transition-colors',
            'text-sm text-neutral-800 dark:text-neutral-100'
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={clsx(
          'font-mono font-bold tabular-nums',
          'text-lg text-neutral-900 dark:text-neutral-50'
        )}
      >
        {value}
      </span>
    </div>
  );
}
