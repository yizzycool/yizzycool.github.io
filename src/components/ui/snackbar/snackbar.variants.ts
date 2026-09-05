import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import { cn } from '@/utils/cn';

export const snackbarVariants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-sky-600 text-white dark:bg-sky-500 dark:text-white border-sky-500/30'
  ),
  secondary: cn(
    'bg-neutral-100 text-slate-900 dark:bg-neutral-800 dark:text-slate-100 border-neutral-600 dark:border-neutral-400'
  ),
  ghost: cn('text-slate-600 dark:text-slate-400 border-neutral-500/20'),
  'ghost-sky': cn(
    'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800'
  ),
  outline: cn(
    'border border-neutral-200 text-slate-700 dark:border-neutral-700 dark:text-slate-300'
  ),
  error: cn(
    'text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/70 border-red-500/30'
  ),
  'dark-sky': cn('text-white bg-sky-600 dark:bg-sky-900 border-sky-500/20'),
  neutral: cn(
    'bg-neutral-100 border-neutral-500/20 text-slate-600 dark:bg-neutral-700 dark:text-slate-400'
  ),
  success: cn(
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  ),
  blue: cn(
    'bg-blue-100 border-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
  ),
  amber: cn(
    'bg-amber-100/90 border-amber-300 text-amber-800 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-300'
  ),
  surface: cn(
    'border border-slate-200 bg-white text-slate-800 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
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
