import type { ReactNode } from 'react';

export type ConfirmDialogVariant =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'amber'
  | 'blue'
  | 'neutral';

/**
 * Props for the ConfirmDialog component.
 */
export type ConfirmDialogProps = {
  /** Controls whether the confirmation dialog is open */
  isOpen: boolean;
  /** Callback fired when user cancels or closes the dialog */
  onClose: () => void;
  /** Callback fired when user clicks the confirm button */
  onConfirm: () => void;
  /** Dialog heading title text */
  title: string;
  /** Detailed confirmation message or custom node */
  message: ReactNode;
  /** Label for the confirm button (default: 'Confirm') */
  confirmText?: string;
  /** Label for the cancel button (default: 'Cancel') */
  cancelText?: string;
  /** Visual variant for the confirm button (default: 'error') */
  confirmVariant?: ConfirmDialogVariant;
  /** Additional CSS classes for the dialog */
  className?: string;
};
