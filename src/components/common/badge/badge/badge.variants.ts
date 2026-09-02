import type { BadgeVariant, BadgeSize } from '@/types/common/badge';
import type { Rounded } from '@/types/common';

import { cn } from '@/utils/cn';

export const badgeVariants: Record<BadgeVariant, string> = {
  primary:
    'bg-sky-600 text-white dark:bg-sky-500 dark:text-white border-transparent',
  secondary:
    'bg-neutral-100 text-slate-900 dark:bg-neutral-800 dark:text-slate-100 border-neutral-600 dark:border-neutral-400',
  ghost: 'text-slate-600 dark:text-slate-400 border-neutral-500/20',
  outline:
    'border border-neutral-200 text-slate-700 dark:border-neutral-700 dark:text-slate-300',
  error:
    'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-800/10 border-red-500/20',
  'dark-sky': 'bg-sky-700/50 text-white dark:bg-sky-600/50 border-sky-500/20',
  neutral:
    'bg-neutral-100 border-neutral-200 dark:border-neutral-700 text-slate-600 dark:bg-neutral-800 dark:text-slate-300',
  success:
    'border border-emerald-600/20 dark:border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  blue: 'bg-blue-300/20 border-blue-500/20 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
  amber:
    'bg-amber-100 border-amber-500/20 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  surface:
    'bg-white text-slate-700 border-slate-200/90 shadow-2xs dark:bg-neutral-900 dark:text-slate-300 dark:border-neutral-800',
};

export const badgeSizes: Record<
  BadgeSize,
  {
    padding: (hasChildren: boolean) => string;
    iconSize: number;
    iconMargin: string;
  }
> = {
  xs: {
    padding: (hasChildren) =>
      cn('text-xs', hasChildren ? 'px-2 py-0.5' : 'p-1'),
    iconSize: 12,
    iconMargin: 'mr-2',
  },
  sm: {
    padding: (hasChildren) =>
      cn('text-sm', hasChildren ? 'px-3 py-1' : 'p-1.5'),
    iconSize: 16,
    iconMargin: 'mr-2',
  },
  base: {
    padding: (hasChildren) =>
      cn('text-base', hasChildren ? 'px-4 py-1.5' : 'p-2'),
    iconSize: 18,
    iconMargin: 'mr-3',
  },
  lg: {
    padding: (hasChildren) =>
      cn('text-lg', hasChildren ? 'px-5 py-2' : 'p-2.5'),
    iconSize: 20,
    iconMargin: 'mr-3',
  },
  xl: {
    padding: (hasChildren) =>
      cn('text-xl', hasChildren ? 'px-6 py-2.5' : 'p-3'),
    iconSize: 24,
    iconMargin: 'mr-4',
  },
};

export const badgeRoundedMap: Record<Rounded, string> = {
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
