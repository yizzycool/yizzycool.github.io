import { useState } from 'react';
import { Upload, X } from 'lucide-react';

import { BaseDialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';

type ManagementImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pendingFile: File | null;
  onConfirmImport: (mode: 'replace' | 'merge') => void;
};

export function ManagementImportModal({
  isOpen,
  onClose,
  pendingFile,
  onConfirmImport,
}: ManagementImportModalProps) {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const handleConfirm = () => {
    onConfirmImport(importMode);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-md p-6"
    >
      <div className="space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-100 p-2 text-slate-700 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-slate-200">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Import Cards
              </h3>
              <p className="text-xs text-slate-400">
                Choose how you want to import your backup JSON
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            rounded="full"
            onClick={onClose}
            title="Close"
            ariaLabel="Close modal"
          />
        </div>

        {/* File Info */}
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          File:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {pendingFile?.name}
          </span>
        </p>

        {/* Import Mode Selection via Chips */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          <Chip
            selected={importMode === 'merge'}
            onClick={() => setImportMode('merge')}
            size="sm"
            className="w-full flex-col !items-stretch gap-1 rounded-xl p-3.5 text-left"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Merge with Existing Library (Recommended)
              </span>
              <Badge
                variant={importMode === 'merge' ? 'primary' : 'neutral'}
                size="xs"
                bordered
              >
                Safe
              </Badge>
            </div>
            <span className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Appends imported cards to your existing library. Conflicting
              hotkeys will be automatically unassigned.
            </span>
          </Chip>

          <Chip
            selected={importMode === 'replace'}
            onClick={() => setImportMode('replace')}
            size="sm"
            className="w-full flex-col !items-stretch gap-1 rounded-xl p-3.5 text-left"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Replace All Existing Cards
              </span>
              <Badge
                variant={importMode === 'replace' ? 'amber' : 'neutral'}
                size="xs"
                bordered
              >
                Overwrite
              </Badge>
            </div>
            <span className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Completely deletes current cards and restores the imported backup
              cards.
            </span>
          </Chip>
        </div>

        {/* Modal Footer with Cancel and OK */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            variant={importMode === 'replace' ? 'amber' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            className="shadow-xs px-4 text-xs font-semibold"
          >
            OK
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
