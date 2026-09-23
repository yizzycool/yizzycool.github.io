import type { DrawerSide } from './types';

export const drawerMotionVariants = {
  top: {
    open: { y: 0 },
    closed: { y: '-100%' },
  },
  bottom: {
    open: { y: 0 },
    closed: { y: '100%' },
  },
  left: {
    open: { x: 0 },
    closed: { x: '-100%' },
  },
  right: {
    open: { x: 0 },
    closed: { x: '100%' },
  },
};

export const drawerPositions: Record<DrawerSide, string> = {
  top: 'fixed top-0 left-0 w-full max-h-[90%]',
  bottom: 'fixed bottom-0 left-0 w-full max-h-[90%]',
  left: 'fixed top-0 left-0 h-full max-w-[90%]',
  right: 'fixed top-0 right-0 h-full max-w-[90%]',
};

export const drawerTransitionClasses: Record<DrawerSide, string> = {
  right:
    'transition-transform duration-300 ease-in-out data-[closed]:translate-x-full',
  left: 'transition-transform duration-300 ease-in-out data-[closed]:-translate-x-full',
  top: 'transition-transform duration-300 ease-in-out data-[closed]:-translate-y-full',
  bottom:
    'transition-transform duration-300 ease-in-out data-[closed]:translate-y-full',
};
