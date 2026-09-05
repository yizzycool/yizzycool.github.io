import type { Rounded } from '@/types/common';
import type { ReactNode } from 'react';

export type DrawerSide = 'top' | 'bottom' | 'left' | 'right';

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  rounded?: Rounded;
  wrapperClassName?: string;
  backdrop?: boolean;
  className?: string;
  usePortal?: boolean;
  children?: ReactNode;
};
