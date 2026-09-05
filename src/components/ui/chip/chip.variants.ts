import type { ChipSize } from './types';

import { cn } from '@/utils/cn';

export const chipSizeStyles: Record<ChipSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-3.5 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const chipBaseStyles =
  'group relative flex items-center gap-2 rounded-lg font-medium transition-all duration-200 shadow-2xs border';

export const getChipVariantStyles = (selected: boolean) =>
  selected
    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20 dark:border-sky-500/80 dark:bg-sky-950/40 dark:text-sky-300'
    : cn(
        'border-neutral-200/80 bg-white/80 text-slate-600',
        'hover:border-slate-300 hover:bg-neutral-50',
        'dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-slate-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80'
      );
