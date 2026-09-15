import type { SelectorSize } from './types';

export const selectorTriggerSizes: Record<SelectorSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  base: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-2xl gap-2.5',
};

export const selectorTriggerStyles =
  'relative flex w-full items-center justify-between border font-mono leading-relaxed outline-none ' +
  'shadow-2xs border-neutral-200/90 bg-white/80 text-slate-800 backdrop-blur-md transition-all duration-200 ' +
  'hover:border-neutral-300 hover:bg-white dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100 ' +
  'dark:hover:border-neutral-600 dark:hover:bg-neutral-900/95 ' +
  'focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 ' +
  'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const selectorBaseStyles = selectorTriggerStyles;

export const selectorChevronSizes: Record<SelectorSize, string> = {
  xs: 'size-3.5',
  sm: 'size-3.5',
  base: 'size-4',
  lg: 'size-5',
};

export const selectorChevronStyles =
  'shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500';

export const selectorMenuStyles =
  'z-50 overflow-y-auto border border-neutral-200/90 bg-white/95 ' +
  'shadow-xl shadow-neutral-900/10 backdrop-blur-xl outline-none ' +
  'dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:shadow-black/40';

export const selectorMenuSizes: Record<SelectorSize, string> = {
  xs: 'rounded-lg p-1 space-y-0.5',
  sm: 'rounded-lg p-1.5 space-y-0.5',
  base: 'rounded-xl p-1.5 space-y-0.5',
  lg: 'rounded-2xl p-2 space-y-1',
};

export const selectorOptionSizes: Record<SelectorSize, string> = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-2.5 py-1.5 text-xs rounded-lg',
  base: 'px-3 py-2 text-sm rounded-xl',
  lg: 'px-3.5 py-2.5 text-base rounded-xl',
};

export const selectorOptionStyles =
  'relative flex cursor-pointer select-none items-center justify-between font-mono ' +
  'text-slate-700 transition-colors duration-150 outline-none ' +
  'hover:bg-sky-50 hover:text-sky-700 ' +
  'dark:text-slate-200 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 ' +
  'aria-selected:bg-sky-500/10 aria-selected:font-semibold aria-selected:text-sky-600 ' +
  'dark:aria-selected:bg-sky-400/15 dark:aria-selected:text-sky-400 ' +
  'data-[focus=true]:bg-sky-50 dark:data-[focus=true]:bg-sky-950/50';

export const selectorOptionDisabledStyles =
  'cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent';
