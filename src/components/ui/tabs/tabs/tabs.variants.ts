import type { TabsVariant, TabsSize } from './types';

export const tabsVariantStyles: Record<
  TabsVariant,
  {
    container: string;
    active: string;
    inactive: string;
  }
> = {
  default: {
    container: 'border-b border-slate-200/80 dark:border-neutral-700',
    active: 'text-sky-600 dark:text-sky-400',
    inactive:
      'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
  },
  sky: {
    container: 'border-b border-sky-100 dark:border-sky-900/50',
    active: 'text-sky-600 dark:text-sky-400',
    inactive:
      'border-transparent text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300',
  },
  neutral: {
    container: 'border-b border-neutral-200 dark:border-neutral-800',
    active: 'text-neutral-900 dark:text-white',
    inactive:
      'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
  },
  'pill-bottom': {
    container: 'border-b border-slate-200/80 dark:border-neutral-800 gap-1',
    active:
      'bg-sky-50/60 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 rounded-t-lg',
    inactive:
      'text-slate-500 hover:bg-neutral-100/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-neutral-800/60 dark:hover:text-slate-200 rounded-t-lg',
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
