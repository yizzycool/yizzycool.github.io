'use client';

import type { NoteHeadingItem } from './types';

import { ChevronDown, ChevronRight, ListTree } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  headings: NoteHeadingItem[];
  headingIdPrefix: string;
};

export default function NoteOutlineBar({ headings, headingIdPrefix }: Props) {
  const [isExpanded, setIsExpanded] = useState(headings.length <= 6);

  if (headings.length < 2) {
    return null;
  }

  const handleJump = (slug: string) => {
    const target = document.getElementById(`${headingIdPrefix}${slug}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="rounded-xl border border-black/[0.07] bg-black/[0.025] px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        <span className="flex items-center gap-1.5">
          <ListTree size={13} className="text-sky-600 dark:text-sky-400" />
          <span>Outline ({headings.length})</span>
        </span>
        {isExpanded ? (
          <ChevronDown size={13} className="opacity-60" />
        ) : (
          <ChevronRight size={13} className="opacity-60" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {headings.map((heading) => (
            <button
              key={heading.slug}
              type="button"
              onClick={() => handleJump(heading.slug)}
              className={cn(
                'rounded-lg border border-black/[0.07] bg-white/75 px-2 py-0.5 text-[11px] transition-colors hover:border-sky-400/60 hover:text-sky-700 dark:border-white/[0.08] dark:bg-neutral-900/60 dark:hover:border-sky-500/50 dark:hover:text-sky-300',
                heading.level === 3
                  ? 'pl-2.5 text-slate-500 dark:text-slate-400'
                  : 'font-medium text-slate-700 dark:text-slate-200'
              )}
            >
              {heading.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
