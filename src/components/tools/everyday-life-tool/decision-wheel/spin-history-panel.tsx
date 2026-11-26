'use client';

import type { SpinRecord, WheelEntry } from './types';

import { History, RotateCcw } from 'lucide-react';

import { CopyAction, DeleteAction } from '@/components/shared/action-button';
import { Button } from '@/components/ui/button';

type Props = {
  history: SpinRecord[];
  eliminatedEntries: WheelEntry[];
  isSpinning: boolean;
  onRestoreEliminated: () => void;
  onClearHistory: () => void;
};

/**
 * Displays eliminated options awaiting restore alongside recent spin winners with one-click copy.
 */
export default function SpinHistoryPanel({
  history,
  eliminatedEntries,
  isSpinning,
  onRestoreEliminated,
  onClearHistory,
}: Props) {
  if (history.length === 0 && eliminatedEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/60">
      {eliminatedEntries.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs dark:border-amber-900/60 dark:bg-amber-950/30">
          <span className="font-medium text-amber-800 dark:text-amber-200">
            {eliminatedEntries.length} option
            {eliminatedEntries.length === 1 ? '' : 's'} drawn &amp; removed
          </span>
          <Button
            variant="ghost"
            size="xs"
            rounded="full"
            bordered
            icon={RotateCcw}
            disabled={isSpinning}
            onClick={onRestoreEliminated}
            className="h-6 px-2.5 text-[11px]"
          >
            Restore All
          </Button>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <History size={13} className="text-sky-500" />
              <span>Recent Spins ({history.length})</span>
            </span>
            <DeleteAction
              display="icon"
              size="xs"
              rounded="lg"
              label="Clear History"
              ariaLabel="Clear spin history"
              successToast={false}
              onClick={onClearHistory}
            />
          </div>

          <div className="max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/70 px-2.5 py-1.5 text-xs dark:border-neutral-800/70 dark:bg-neutral-950/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: record.color }}
                  />
                  <span className="truncate font-medium text-neutral-800 dark:text-neutral-100">
                    {record.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                    {record.oddsPercent}%
                  </span>
                  <CopyAction
                    display="icon"
                    size="xs"
                    rounded="md"
                    content={record.label}
                    successToast={`Copied "${record.label}"`}
                    ariaLabel={`Copy ${record.label}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
