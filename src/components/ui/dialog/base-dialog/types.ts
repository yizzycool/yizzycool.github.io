import type { ReactNode } from 'react';

export type BaseDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  dialogClassName?: string;
  backdropClassName?: string;
  backdrop?: boolean;
  portal?: boolean;
  portalContainer?: string | HTMLElement | null;
  unmount?: boolean;
  children?: ReactNode;
};
