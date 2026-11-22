'use client';

import type { ParsedKeepNote } from './types';

import { CheckSquare, Pin, Square } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

import { NOTE_COLOR_STYLES } from './constants';

type Props = {
  note: ParsedKeepNote;
  selected: boolean;
  onToggle: (tempId: string) => void;
};

export default function KeepImportRow({ note, selected, onToggle }: Props) {
  const colorStyle = NOTE_COLOR_STYLES[note.color];
  const snippet = note.content.replace(/\s+/g, ' ').trim();

  return (
    <button
      type="button"
      onClick={() => onToggle(note.tempId)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        selected
          ? 'bg-sky-50/60 hover:bg-sky-50 dark:bg-sky-950/25 dark:hover:bg-sky-950/35'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
      )}
    >
      <span className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400">
        {selected ? (
          <CheckSquare size={16} />
        ) : (
          <Square size={16} className="text-slate-300 dark:text-slate-600" />
        )}
      </span>

      <span
        className={cn(
          'mt-1.5 size-2.5 shrink-0 rounded-full border',
          colorStyle.swatch
        )}
        title={colorStyle.name}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {note.title || 'Untitled Note'}
          </span>
          {note.isPinned && (
            <Badge variant="amber" size="xs" icon={Pin}>
              Pinned
            </Badge>
          )}
          {note.isArchived && (
            <Badge variant="neutral" size="xs">
              Archived
            </Badge>
          )}
          {note.labels.map((label) => (
            <Badge key={label} variant="primary" size="xs">
              #{label}
            </Badge>
          ))}
        </div>

        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {snippet || '(Empty note)'}
        </p>
      </div>
    </button>
  );
}
