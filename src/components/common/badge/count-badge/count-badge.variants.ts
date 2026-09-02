import type { CountBadgeVariant, CountBadgeSize } from './types';

export const countBadgeVariantStyles: Record<CountBadgeVariant, string> = {
  subtle:
    'bg-neutral-200/70 text-slate-500 dark:bg-neutral-800 dark:text-slate-400',
  inverted: 'bg-white/25 text-white dark:bg-white/20 dark:text-white',
  'subtle-inverted':
    'bg-white/20 text-white/85 dark:bg-white/15 dark:text-white/80',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  solid: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  neutral:
    'bg-neutral-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300',
  ghost: 'bg-transparent text-slate-500 dark:text-slate-400',
};

export const countBadgeSizeStyles: Record<CountBadgeSize, string> = {
  xs: 'h-4 min-w-4 px-1 text-[10px]',
  sm: 'h-4.5 min-w-[18px] px-1.5 text-xs',
  base: 'h-5 min-w-5 px-1.5 text-xs',
};
