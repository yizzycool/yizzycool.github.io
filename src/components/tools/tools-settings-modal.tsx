'use client';

import { useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  PauseCircle,
  Clock,
  X,
} from 'lucide-react';

import { toast } from '@/utils/toast';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import { BaseDialog, ConfirmDialog } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DeleteAction } from '@/components/shared/action-button';

export interface ToolsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolsSettingsModal({
  isOpen,
  onClose,
}: ToolsSettingsModalProps) {
  const { isGlobalHistoryPaused, setIsGlobalHistoryPaused } =
    useToolsPreferences();

  const { clearStore } = useToolsDB();

  const [isWipeHistoryConfirmOpen, setIsWipeHistoryConfirmOpen] =
    useState(false);

  const handleWipeAllHistory = async () => {
    await clearStore('history').catch(() => {});
    toast.success('All history snapshots across all tools have been wiped');
  };

  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        dialogClassName="w-full max-w-md overflow-hidden rounded-2xl p-5 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Preferences & Privacy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage global history recording and local data
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="base"
            rounded="full"
            icon={X}
            onClick={onClose}
            ariaLabel="Close settings"
          />
        </div>

        {/* Settings Body */}
        <div className="space-y-3.5 py-4">
          {/* Section 1: Global History Recording */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Clock
                    size={15}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Record History
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Save execution snapshots locally across all tools.
                </p>
              </div>
              <Switch
                size="sm"
                checked={!isGlobalHistoryPaused}
                onChange={(checked) => setIsGlobalHistoryPaused(!checked)}
                aria-label="Toggle global history recording"
              />
            </div>

            {/* Incognito mode banner */}
            {isGlobalHistoryPaused && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/80 p-2.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <PauseCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                />
                <span>
                  All tools are paused. No history will be saved to your
                  browser.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Storage & Wipeout */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Wipe Tool History
                </span>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Permanently delete all snapshots saved in your browser.
                </p>
              </div>
              <DeleteAction
                variant="error"
                size="xs"
                rounded="lg"
                bordered
                onClick={() => setIsWipeHistoryConfirmOpen(true)}
                label="Wipe All"
                className="shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <ShieldCheck
            size={13}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
          <span>All data is stored locally and never sent to any server</span>
        </div>
      </BaseDialog>

      {/* Confirm Wipe All Tools History */}
      <ConfirmDialog
        isOpen={isWipeHistoryConfirmOpen}
        onClose={() => setIsWipeHistoryConfirmOpen(false)}
        onConfirm={handleWipeAllHistory}
        title="Wipe All Tools History"
        message="Are you sure you want to permanently delete all snapshots across all tools in the database? This action cannot be undone."
        confirmText="Wipe All History"
        confirmVariant="error"
      />
    </>
  );
}

export default ToolsSettingsModal;
