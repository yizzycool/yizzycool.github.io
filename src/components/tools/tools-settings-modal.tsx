'use client';

import { useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  PauseCircle,
  Clock,
  Trash2,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { toast } from '@/utils/toast';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import {
  BaseDialog,
  ConfirmDialog,
  DialogHeader,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { TOOLS_WITH_HISTORY } from '@/components/tools/common/header-block/constants';
import ToolsSettingsHistoryItem from './tools-settings-history-item';
import { Separator } from '../ui/separator';

export interface ToolsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolsSettingsModal({
  isOpen,
  onClose,
}: ToolsSettingsModalProps) {
  const {
    isGlobalHistoryPaused,
    setIsGlobalHistoryPaused,
    isHistoryEnabled,
    toggleHistoryEnabled,
  } = useToolsPreferences();

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
        <DialogHeader
          icon={SlidersHorizontal}
          title="Preferences & Privacy"
          description="Manage global history recording and local data"
          onClose={onClose}
          closeAriaLabel="Close settings"
          bordered={false}
        />

        <Separator />

        {/* Settings Body */}
        <div className="space-y-3.5 py-4">
          {/* Section 1: Global History Recording & Per-Tool Permissions */}
          <div
            className={cn(
              'rounded-xl border p-3.5',
              'border-slate-200/80 bg-slate-50/50',
              'dark:border-slate-800 dark:bg-slate-900/40'
            )}
          >
            {/* Master Toggle */}
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
                  Save execution snapshots locally across tools.
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
              <div
                className={cn(
                  'mt-3 flex items-start gap-2 rounded-lg border p-2.5 text-xs',
                  'border-amber-200/60 bg-amber-50/80 text-amber-800',
                  'dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300'
                )}
              >
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

            {/* Per-Tool Permissions */}
            <div
              className={cn(
                'mt-3.5 border-t pt-3',
                'border-slate-200/70 dark:border-slate-800/80'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-wider',
                    'text-slate-400 dark:text-slate-500'
                  )}
                >
                  Supported Tools
                </span>
                {isGlobalHistoryPaused && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400">
                    Disabled while paused
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {TOOLS_WITH_HISTORY.map((toolKey) => (
                  <ToolsSettingsHistoryItem
                    key={toolKey}
                    toolKey={toolKey}
                    isGlobalHistoryPaused={isGlobalHistoryPaused}
                    isEnabled={isHistoryEnabled(toolKey)}
                    onToggle={(checked) =>
                      toggleHistoryEnabled(toolKey, checked)
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Danger Action - Streamlined Wipeout Link */}
          <div className="flex items-center justify-center pt-4">
            <button
              type="button"
              onClick={() => setIsWipeHistoryConfirmOpen(true)}
              className={cn(
                'group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                'text-xs font-medium text-rose-500 transition-colors',
                'hover:text-rose-600 hover:underline',
                'dark:text-rose-400 dark:hover:text-rose-300'
              )}
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Clear all tools history data</span>
            </button>
          </div>
        </div>

        <Separator />

        {/* Footer Disclaimer */}
        <div
          className={cn(
            'flex items-center justify-center gap-1.5 pt-3 text-[11px]',
            'text-slate-400 dark:text-slate-500'
          )}
        >
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
