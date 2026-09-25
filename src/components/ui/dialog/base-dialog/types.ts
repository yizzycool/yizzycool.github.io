import type { ReactNode } from 'react';

/**
 * Props for the BaseDialog modal component.
 */
export type BaseDialogProps = {
  /** Controls whether the dialog is open and visible */
  isOpen: boolean;
  /** Callback fired when dialog close is requested (via backdrop click or Escape key) */
  onClose?: () => void;
  /** Custom CSS classes for the outer wrapper */
  className?: string;
  /** Custom CSS classes for the dialog panel container */
  dialogClassName?: string;
  /** Custom CSS classes for the backdrop overlay */
  backdropClassName?: string;
  /** Whether to render the semi-transparent backdrop overlay (default: true) */
  backdrop?: boolean;
  /** Dialog panel children content */
  children?: ReactNode;
};
