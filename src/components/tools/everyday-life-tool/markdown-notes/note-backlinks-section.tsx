'use client';

import type { NoteItem } from './types';

import { CornerDownRight } from 'lucide-react';

type Props = {
  backlinks: NoteItem[];
  onOpenNote: (id: string) => void;
};

export default function NoteBacklinksSection({ backlinks, onOpenNote }: Props) {
  if (backlinks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-black/[0.07] bg-black/[0.03] px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <CornerDownRight
          size={12}
          className="text-indigo-500 dark:text-indigo-400"
        />
        <span>Linked from ({backlinks.length})</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {backlinks.map((sourceNote) => (
          <button
            key={sourceNote.id}
            type="button"
            onClick={() => onOpenNote(sourceNote.id)}
            className="rounded-lg border border-black/[0.08] bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-400/60 hover:text-indigo-700 dark:border-white/10 dark:bg-neutral-900/70 dark:text-slate-200 dark:hover:border-indigo-400/60 dark:hover:text-indigo-300"
          >
            {sourceNote.title.trim() || 'Untitled Note'}
          </button>
        ))}
      </div>
    </div>
  );
}
