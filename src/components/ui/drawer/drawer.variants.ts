import type { Rounded } from '@/types/common';
import type { DrawerSide } from './types';

export const drawerRoundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export const drawerSideRoundedMap: Record<DrawerSide, (r: string) => string> = {
  top: (r) => r.replace('rounded', 'rounded-b'),
  bottom: (r) => r.replace('rounded', 'rounded-t'),
  left: (r) => r.replace('rounded', 'rounded-r'),
  right: (r) => r.replace('rounded', 'rounded-l'),
};

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
  top: 'top-0 left-0 w-full max-h-[90%]',
  bottom: 'bottom-0 left-0 w-full max-h-[90%]',
  left: 'top-0 left-0 h-full max-w-[90%]',
  right: 'top-0 right-0 h-full max-w-[90%]',
};
