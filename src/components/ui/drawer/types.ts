import type { ReactNode } from 'react';

export type DrawerSide = 'top' | 'bottom' | 'left' | 'right';

/**
 * Props for the slide-over Drawer component.
 */
export type DrawerProps = {
  /** Controls open/closed visibility */
  isOpen: boolean;
  /** Close event callback */
  onClose: () => void;
  /** Edge of the screen from which the drawer slides out (default: 'right') */
  side?: DrawerSide;
  /** Additional CSS class names for outer container */
  className?: string;
  /** Additional CSS class names for the drawer panel */
  drawerClassName?: string;
  /** Additional CSS class names for backdrop */
  backdropClassName?: string;
  /** Whether to render the backdrop overlay (default: true) */
  backdrop?: boolean;
  /** Whether to portal the drawer to body (default: true) */
  portal?: boolean;
  /** Target element to portal into */
  portalContainer?: string | HTMLElement | null;
  /** Whether to unmount content when closed (default: true) */
  unmount?: boolean;
  /** Drawer panel content */
  children?: ReactNode;
};
