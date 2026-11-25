'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

type KpiTileProps = {
  label: string;
  value: number | string;
  subLabel?: string;
  icon: LucideIcon;
  className?: string;
};

export function KpiTile({
  label,
  value,
  subLabel,
  icon: Icon,
  className,
}: KpiTileProps) {
  return (
    <div
      className={cn(
        'shadow-2xs flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white/75 p-3 backdrop-blur-md transition-colors',
        'dark:border-neutral-800 dark:bg-neutral-900/55',
        className
      )}
    >
      <div className="flex items-center justify-between gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span className="truncate">{label}</span>
        <Icon size={13} className="shrink-0 text-sky-500 dark:text-sky-400" />
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-lg font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </span>
        {subLabel && (
          <span className="truncate text-[10px] text-slate-400 dark:text-slate-500">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
