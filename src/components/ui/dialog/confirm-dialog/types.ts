import type { ButtonVariant } from '@/components/ui/button';
import type { ReactNode } from 'react';

export type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  className?: string;
};
