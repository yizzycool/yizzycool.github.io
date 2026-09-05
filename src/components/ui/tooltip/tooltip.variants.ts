import type { TooltipVariant } from './types';

type VariantStyles = {
  container: string;
  arrow: string;
};

export const tooltipVariants: Record<TooltipVariant, VariantStyles> = {
  card: {
    container:
      'rounded-xl border border-slate-200/90 bg-white/95 text-slate-800 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-slate-100 dark:shadow-black/50',
    arrow:
      'bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800',
  },
  dark: {
    container:
      'rounded-lg border border-neutral-700/80 bg-neutral-900 text-slate-100 shadow-lg text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200',
    arrow:
      'bg-neutral-900 dark:bg-neutral-800 border-neutral-700/80 dark:border-neutral-700',
  },
  light: {
    container:
      'rounded-lg border border-slate-200 bg-white text-slate-800 shadow-md text-xs dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900',
    arrow:
      'bg-white dark:bg-neutral-100 border-slate-200 dark:border-neutral-700',
  },
  accent: {
    container:
      'rounded-xl border border-sky-500/30 bg-neutral-950/95 text-slate-100 shadow-lg shadow-sky-500/10 backdrop-blur-md dark:border-sky-500/40 dark:bg-neutral-950/95 dark:shadow-sky-500/20 text-xs',
    arrow: 'bg-neutral-950 border-sky-500/30 dark:border-sky-500/40',
  },
  inverse: {
    container:
      'rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-md text-xs dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900',
    arrow:
      'bg-neutral-900 border-neutral-800 dark:bg-slate-50 dark:border-slate-200',
  },
  raw: {
    container: '',
    arrow: '',
  },
};

export const arrowBorderBySide: Record<string, string> = {
  top: 'border-t border-l',
  bottom: 'border-b border-r',
  left: 'border-b border-l',
  right: 'border-t border-r',
};
