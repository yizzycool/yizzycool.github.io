'use client';

import type { LucideIcon } from 'lucide-react';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

export type RelatedToolItemProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function RelatedToolItem({
  href,
  title,
  description,
  icon: Icon,
}: RelatedToolItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'shadow-2xs group flex items-start gap-3 rounded-xl border p-3.5 text-left backdrop-blur-md transition-all duration-200',
        'border-neutral-200/80 bg-white/75 hover:-translate-y-0.5 hover:border-sky-400/60 hover:bg-white hover:shadow-sm',
        'dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-sky-500/60 dark:hover:bg-neutral-900/80'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-100 group-hover:text-sky-600 dark:bg-neutral-800 dark:text-slate-300 dark:group-hover:bg-sky-950/60 dark:group-hover:text-sky-400">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-sky-600 sm:text-sm dark:text-slate-100 dark:group-hover:text-sky-400">
            {title}
          </span>
          <ArrowUpRight
            size={14}
            className="shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-500 dark:text-slate-500"
          />
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
