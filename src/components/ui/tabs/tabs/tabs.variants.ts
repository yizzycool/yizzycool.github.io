import type { TabsVariant, TabsSize } from './types';

export const tabsVariantStyles: Record<
  TabsVariant,
  {
    container: string;
    active: string;
    inactive: string;
    borderWidth: string;
  }
> = {
  default: {
    container: 'border-b border-slate-200/80 dark:border-neutral-700',
    active:
      'border-sky-600 font-bold text-sky-600 dark:border-sky-400 dark:text-sky-400',
    inactive:
      'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
    borderWidth: 'border-b-4',
  },
  sky: {
    container: 'border-b border-sky-100 dark:border-sky-900/50',
    active:
      'border-sky-500 font-bold text-sky-600 dark:border-sky-400 dark:text-sky-400',
    inactive:
      'border-transparent text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300',
    borderWidth: 'border-b-2',
  },
  neutral: {
    container: 'border-b border-neutral-200 dark:border-neutral-800',
    active:
      'border-neutral-900 font-bold text-neutral-900 dark:border-white dark:text-white',
    inactive:
      'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
    borderWidth: 'border-b-2',
  },
  'pill-bottom': {
    container: 'border-b border-slate-200/80 dark:border-neutral-800 gap-1',
    active:
      'border-sky-500 bg-sky-50/60 font-bold text-sky-700 dark:border-sky-400 dark:bg-sky-950/40 dark:text-sky-300 rounded-t-lg',
    inactive:
      'border-transparent text-slate-500 hover:bg-neutral-100/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-neutral-800/60 dark:hover:text-slate-200 rounded-t-lg',
    borderWidth: 'border-b-2',
  },
};

export const tabsSizeStyles: Record<
  TabsSize,
  {
    text: string;
    padding: string;
    gap: string;
    iconSize: number;
  }
> = {
  xs: {
    text: 'text-xs',
    padding: 'pt-1 pb-2 px-2.5',
    gap: 'gap-1.5',
    iconSize: 13,
  },
  sm: {
    text: 'text-xs sm:text-sm',
    padding: 'pt-1.5 pb-2.5 px-3',
    gap: 'gap-1.5',
    iconSize: 14,
  },
  base: {
    text: 'text-sm',
    padding: 'pt-2 pb-3 px-3.5',
    gap: 'gap-2',
    iconSize: 16,
  },
  lg: {
    text: 'text-base',
    padding: 'pt-2.5 pb-3.5 px-4',
    gap: 'gap-2',
    iconSize: 18,
  },
  xl: {
    text: 'text-lg',
    padding: 'pt-3 pb-4 px-5',
    gap: 'gap-2.5',
    iconSize: 20,
  },
};
