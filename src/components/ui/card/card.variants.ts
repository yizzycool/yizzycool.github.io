import type { Animation, Rounded } from '@/types/common';

export const cardRoundedMap: Record<Rounded, string> = {
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

export const cardAnimations: Record<Animation, string> = {
  none: '',
  'fade-in': 'animate-in fade-in duration-500',
};

export const cardBaseStyles =
  'border p-6 text-left transition-all duration-300 ' +
  'border-neutral-200/90 ring-1 ring-black/[0.03] dark:border-neutral-800 dark:ring-1 dark:ring-white/[0.04] ' +
  'bg-gradient-to-b from-white/95 via-neutral-50/75 to-white/95 ' +
  'dark:from-neutral-900/95 dark:via-neutral-950/80 dark:to-neutral-900/95 ' +
  'shadow-xs hover:shadow-sm dark:shadow-black/40';
