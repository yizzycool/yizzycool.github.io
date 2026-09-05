import type { Rounded } from '@/types/common';
import type { BadgeSize } from '@/types/common/badge';
import type { HotkeyBadgeColor } from './types';

export const hotkeyColors: Record<
  HotkeyBadgeColor,
  {
    bg: string;
    text: string;
    border: string;
    shadow: string;
  }
> = {
  neutral: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-neutral-200 dark:border-neutral-700',
    shadow: 'shadow-xs',
  },
  ghost: {
    bg: 'bg-transparent',
    text: 'text-slate-400 dark:text-slate-500',
    border: 'border-transparent',
    shadow: 'shadow-none',
  },
  inverted: {
    bg: 'bg-white/20 dark:bg-white/10',
    text: 'text-white dark:text-slate-200',
    border: 'border-white/20 dark:border-white/10',
    shadow: 'shadow-none',
  },
  surface: {
    bg: 'bg-white dark:bg-neutral-900',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-neutral-200/90 dark:border-neutral-800',
    shadow: 'shadow-xs',
  },
};

export const hotkeyTextSizes: Record<BadgeSize, string> = {
  xs: 'text-[9px]',
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export const hotkeyPaddings: Record<BadgeSize, string> = {
  xs: 'p-1',
  sm: 'px-1.5 py-1',
  base: 'px-2 py-1.5',
  lg: 'px-2.5 py-2',
  xl: 'px-3 py-2.5',
};

export const hotkeyRoundedMap: Record<Rounded, string> = {
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
