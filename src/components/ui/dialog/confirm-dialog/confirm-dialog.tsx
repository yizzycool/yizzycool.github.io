'use client';

import type { ConfirmDialogProps } from './types';

import { X } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { BaseDialog } from '../base-dialog';
import {
  confirmDialogBaseStyles,
  confirmDialogCloseButtonStyles,
} from './confirm-dialog.variants';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'error',
  className = '',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className={cn(confirmDialogBaseStyles, className)}
    >
      <div className="space-y-4 text-left">
        {/* Header with Title and X button */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className={confirmDialogCloseButtonStyles}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" rounded="lg" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            rounded="lg"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
