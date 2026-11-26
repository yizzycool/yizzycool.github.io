'use client';

import type { SpinRecord } from './types';

import { Ban, RotateCw, Trophy } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

type Props = {
  record: SpinRecord | null;
  eliminateOnWin: boolean;
  canSpinAgain: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onEliminateWinner: (entryId: string) => void;
};

/**
 * Celebratory modal announcing the winning wheel slice with instant remove, copy, and spin-again actions.
 */
export default function WinnerDialog({
  record,
  eliminateOnWin,
  canSpinAgain,
  onClose,
  onSpinAgain,
  onEliminateWinner,
}: Props) {
  return (
    <BaseDialog
      isOpen={record !== null}
      onClose={onClose}
      dialogClassName="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {record && (
        <div>
          <DialogHeader
            title="We Have a Winner!"
            description="Selected fairly via Web Crypto RNG"
            icon={Trophy}
            iconContainerClassName="bg-amber-500/15 text-amber-500"
            onClose={onClose}
            className="px-5 py-4"
          />

          <div className="space-y-5 p-6 text-center">
            <div
              className="mx-auto flex max-w-full flex-col items-center gap-2 rounded-2xl border border-neutral-200/80 px-5 py-6 shadow-inner dark:border-neutral-800"
              style={{
                background: `linear-gradient(135deg, ${record.color}22 0%, ${record.color}0a 100%)`,
              }}
            >
              <span
                className="h-3.5 w-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: record.color }}
              />
              <p className="break-words text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {record.label}
              </p>
              <span className="rounded-full border border-neutral-200/80 bg-white/80 px-2.5 py-0.5 font-mono text-[11px] font-medium text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-300">
                Win chance: {record.oddsPercent}%
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <CopyAction
                display="icon-label"
                label="Copy Result"
                size="sm"
                rounded="xl"
                bordered
                content={record.label}
                successToast={`Copied "${record.label}" to clipboard`}
              />

              {!eliminateOnWin && (
                <Button
                  variant="secondary"
                  size="sm"
                  rounded="xl"
                  bordered
                  icon={Ban}
                  onClick={() => onEliminateWinner(record.entryId)}
                >
                  Remove Option
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                rounded="xl"
                icon={RotateCw}
                disabled={!canSpinAgain}
                onClick={onSpinAgain}
              >
                Spin Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </BaseDialog>
  );
}
