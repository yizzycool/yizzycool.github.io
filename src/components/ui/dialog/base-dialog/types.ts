import type { ReactNode } from 'react';

export type PortalConfig = {
  selectorOrElement?: string | HTMLElement;
  portalKey?: string;
};

export type BaseDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  hasBackdrop?: boolean;
  className?: string;
  dialogClassName?: string;
  backdropClassName?: string;
  children?: ReactNode;
  portalConfig?: PortalConfig;
};
