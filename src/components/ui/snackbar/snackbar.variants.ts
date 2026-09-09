import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import { cn } from '@/utils/cn';

export const snackbarVariants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-sky-50/90 text-sky-800 border-sky-500/30 dark:bg-sky-950/85 dark:text-sky-300 dark:border-sky-500/30'
  ),
  secondary: cn(
    'bg-neutral-100/90 text-slate-900 border-neutral-200/80 dark:bg-neutral-800/85 dark:text-slate-100 dark:border-neutral-700/80'
  ),
  ghost: cn(
    'bg-neutral-100/60 text-slate-600 border-neutral-500/20 dark:bg-neutral-800/50 dark:text-slate-400'
  ),
  'ghost-sky': cn(
    'bg-sky-50/90 text-sky-700 border-sky-300/40 dark:bg-sky-950/85 dark:text-sky-300 dark:border-sky-800/60'
  ),
  outline: cn(
    'bg-white/70 border-neutral-200 text-slate-700 dark:bg-neutral-900/70 dark:border-neutral-700 dark:text-slate-300'
  ),
  error: cn(
    'bg-rose-50/90 text-rose-800 border-rose-500/30 dark:bg-rose-950/85 dark:text-rose-300 dark:border-rose-500/30'
  ),
  'dark-sky': cn(
    'bg-sky-900/90 text-white border-sky-500/30 dark:bg-sky-950/90 dark:border-sky-500/40'
  ),
  neutral: cn(
    'bg-neutral-100/90 text-slate-600 border-neutral-300/40 dark:bg-neutral-800/85 dark:text-slate-300 dark:border-neutral-700/40'
  ),
  success: cn(
    'bg-emerald-50/90 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950/85 dark:text-emerald-300 dark:border-emerald-500/30'
  ),
  blue: cn(
    'bg-blue-50/90 text-blue-800 border-blue-500/30 dark:bg-blue-950/85 dark:text-blue-300 dark:border-blue-500/30'
  ),
  amber: cn(
    'bg-amber-50/90 text-amber-800 border-amber-500/30 dark:bg-amber-950/85 dark:text-amber-300 dark:border-amber-500/30'
  ),
  surface: cn(
    'bg-white/90 text-slate-800 border-slate-200/80 shadow-lg dark:bg-neutral-900/90 dark:text-slate-200 dark:border-neutral-800/80'
  ),
};

export const snackbarSizes: Record<ButtonSize, string> = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  base: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
  xl: 'text-lg px-6 py-3.5',
};

export const snackbarRoundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded-xl',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};
