'use client';

import { X } from 'lucide-react';
import BaseDialog from '../base';
import Button from '../../button';
import { cn } from '@/utils/cn';
import { ButtonVariant } from '@/types/common/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  className?: string;
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'error',
  className = '',
}: Props) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className={cn('w-full max-w-md p-6', className)}
    >
      <div className="space-y-4 text-left">
        {/* Header with Title and X button */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
