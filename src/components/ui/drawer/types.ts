import type { ReactNode } from 'react';

export type DrawerSide = 'top' | 'bottom' | 'left' | 'right';

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  className?: string;
  drawerClassName?: string;
  backdropClassName?: string;
  backdrop?: boolean;
  portal?: boolean;
  portalContainer?: string | HTMLElement | null;
  unmount?: boolean;
  children?: ReactNode;
};
