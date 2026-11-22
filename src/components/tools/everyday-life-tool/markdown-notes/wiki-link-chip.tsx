'use client';

import type { MouseEvent } from 'react';

import { Link2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  targetTitle: string;
  displayText: string;
  exists: boolean;
  onNavigate?: (title: string) => void;
};

export default function WikiLinkChip({
  targetTitle,
  displayText,
  exists,
  onNavigate,
}: Props) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onNavigate?.(targetTitle);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        exists
          ? `Open note: ${targetTitle}`
          : `Create & open note: ${targetTitle}`
      }
      className={cn(
        'mx-0.5 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 align-baseline text-[0.92em] font-medium transition-colors',
        exists
          ? 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/25 hover:bg-indigo-500/20 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/30 dark:hover:bg-indigo-400/25'
          : 'border border-dashed border-slate-400/60 bg-slate-500/[0.06] text-slate-600 hover:border-sky-500/60 hover:text-sky-700 dark:border-slate-500/50 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-300'
      )}
    >
      <Link2 size={11} className="shrink-0 opacity-75" />
      <span>{displayText}</span>
    </button>
  );
}
