'use client';

import type { HistoryEntry } from './types/studio';

import { History, Redo2, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type Props = {
  entries: HistoryEntry[];
  activeIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (index: number) => void;
};

/**
 * Right Inspector History timeline showing labeled snapshots and 1-click time travel.
 */
export default function InspectorHistoryTab({
  entries,
  activeIndex,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onJumpTo,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          <History className="h-3.5 w-3.5 text-sky-500" />
          <span>Auto-saved locally</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={Undo2}
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Redo2}
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo"
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0"
          />
        </div>
      </div>

      <div className="space-y-1">
        {entries.map((entry, idx) => {
          const isCurrent = idx === activeIndex;
          const isFuture = idx > activeIndex;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onJumpTo(idx)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors',
                isCurrent
                  ? 'bg-sky-500/15 font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                  : isFuture
                    ? 'text-neutral-400 hover:bg-neutral-100/70 dark:text-neutral-600 dark:hover:bg-neutral-800/50'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
              )}
            >
              <span className="truncate">{entry.label}</span>
              <span className="ml-2 shrink-0 font-mono text-[10px] opacity-60">
                #{idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
