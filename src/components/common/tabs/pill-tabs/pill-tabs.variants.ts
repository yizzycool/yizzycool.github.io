import type { PillTabsVariant, PillTabsSize } from './types';
import type { Rounded } from '@/types/common';

export const pillTabsRoundedMap: Record<
  Rounded,
  { container: string; item: string }
> = {
  none: { container: 'rounded-none', item: 'rounded-none' },
  sm: { container: 'rounded-md', item: 'rounded-sm' },
  base: { container: 'rounded-xl', item: 'rounded-lg' },
  md: { container: 'rounded-lg', item: 'rounded-md' },
  lg: { container: 'rounded-xl', item: 'rounded-lg' },
  xl: { container: 'rounded-2xl', item: 'rounded-xl' },
  '2xl': { container: 'rounded-2xl', item: 'rounded-xl' },
  '3xl': { container: 'rounded-3xl', item: 'rounded-2xl' },
  full: { container: 'rounded-full', item: 'rounded-full' },
};

export const pillTabsVariantStyles: Record<
  PillTabsVariant,
  {
    container: string;
    active: string;
    inactive: string;
  }
> = {
  segment: {
    container:
      'border border-neutral-200/80 bg-neutral-100/80 p-1 dark:border-neutral-700/80 dark:bg-neutral-800/80',
    active:
      'shadow-xs bg-white text-sky-600 dark:bg-neutral-900 dark:text-sky-400 font-semibold',
    inactive:
      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  },
  default: {
    container: 'bg-slate-100/80 p-1 shadow-inner dark:bg-neutral-800/80',
    active:
      'shadow-xs bg-white text-slate-900 dark:bg-neutral-900 dark:text-slate-100 font-semibold',
    inactive:
      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  },
  neutral: {
    container:
      'border border-neutral-200/80 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-900/60',
    active:
      'shadow-xs bg-white text-slate-900 dark:bg-neutral-800 dark:text-slate-100 font-semibold',
    inactive:
      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  },
  primary: {
    container:
      'border border-neutral-200/80 bg-neutral-100/90 p-1 dark:border-neutral-700/80 dark:bg-neutral-800/90',
    active:
      'shadow-xs bg-sky-600 text-white dark:bg-sky-500 dark:text-white font-semibold',
    inactive:
      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  },
  ghost: {
    container: 'bg-neutral-100/50 p-1 dark:bg-neutral-800/40',
    active:
      'bg-neutral-200/80 text-slate-900 dark:bg-neutral-700/80 dark:text-slate-100 font-semibold',
    inactive:
      'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  },
  outline: {
    container:
      'border border-neutral-200/80 bg-transparent p-1 dark:border-neutral-700/80',
    active:
      'border border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-300 font-semibold',
    inactive:
      'border border-transparent text-slate-600 hover:bg-neutral-100/60 dark:text-slate-400 dark:hover:bg-neutral-800/60',
  },
  blue: {
    container:
      'border border-sky-100 bg-sky-50/60 p-1 dark:border-sky-900/40 dark:bg-sky-950/30',
    active:
      'shadow-xs bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold',
    inactive:
      'text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100',
  },
};

export const pillTabsSizeStyles: Record<
  PillTabsSize,
  {
    text: string;
    padding: string;
    gap: string;
    iconSize: number;
  }
> = {
  xs: {
    text: 'text-xs',
    padding: 'px-3 py-1.5',
    gap: 'gap-1.5',
    iconSize: 13,
  },
  sm: {
    text: 'text-xs',
    padding: 'px-3.5 py-1.5',
    gap: 'gap-1.5',
    iconSize: 14,
  },
  base: {
    text: 'text-sm',
    padding: 'px-4 py-2',
    gap: 'gap-2',
    iconSize: 16,
  },
  lg: {
    text: 'text-base',
    padding: 'px-5 py-2.5',
    gap: 'gap-2',
    iconSize: 18,
  },
  xl: {
    text: 'text-lg',
    padding: 'px-6 py-3',
    gap: 'gap-2.5',
    iconSize: 20,
  },
};
