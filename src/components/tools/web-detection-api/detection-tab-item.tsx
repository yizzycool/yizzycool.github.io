'use client';

import type { DetectionTab } from './data/detection-tabs';

import Link from 'next/link';

import { cn } from '@/utils/cn';

type Props = {
  tab: DetectionTab;
  isActive: boolean;
};

export default function DetectionTabItem({ tab, isActive }: Props) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
        isActive
          ? 'bg-white text-slate-900 shadow-sm dark:bg-neutral-800 dark:text-white'
          : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800/50 dark:hover:text-white'
      )}
    >
      <Icon size={14} className={isActive ? 'text-blue-500' : ''} />
      <span>{tab.label}</span>
    </Link>
  );
}
