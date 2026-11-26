import type { ClassNames } from 'react-day-picker';
import type { DatePickerSize } from './types';

export const datePickerTriggerSizes: Record<DatePickerSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-xl gap-2',
  base: 'px-4 py-2.5 text-sm rounded-xl gap-2.5 sm:text-base',
};

export const datePickerTriggerStyles =
  'flex w-full items-center justify-between border font-mono outline-none transition-all duration-200 ' +
  'border-neutral-200/90 bg-white/80 text-slate-800 shadow-2xs backdrop-blur-md ' +
  'hover:border-neutral-300 hover:bg-white ' +
  'focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/20 ' +
  'dark:border-neutral-700/80 dark:bg-neutral-900/75 dark:text-slate-100 ' +
  'dark:hover:border-neutral-600 dark:hover:bg-neutral-900 ' +
  'dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const datePickerPopoverStyles =
  'z-50 w-[296px] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 p-3 ' +
  'shadow-2xl shadow-neutral-900/15 backdrop-blur-xl outline-none ' +
  'dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:shadow-black/50';

export const datePickerDayPickerClassNames: Partial<ClassNames> = {
  root: 'w-full select-none',
  months: 'relative flex flex-col',
  month: 'space-y-3',
  month_caption: 'relative flex h-8 items-center justify-center px-8',
  caption_label:
    'inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white/80 px-2 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100/80 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-800',
  dropdowns: 'flex items-center justify-center gap-1.5',
  dropdown_root: 'relative inline-flex items-center',
  dropdown: 'absolute inset-0 w-full cursor-pointer opacity-0',
  nav: 'flex items-center justify-between',
  button_previous:
    'absolute left-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white/70 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:bg-neutral-800',
  button_next:
    'absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white/70 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:bg-neutral-800',
  month_grid: 'w-full border-collapse',
  weekdays: 'grid grid-cols-7 mb-1',
  weekday:
    'flex h-8 w-full items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500',
  weeks: 'space-y-1',
  week: 'grid grid-cols-7',
  day: 'flex h-9 w-full items-center justify-center p-0 text-center text-xs',
  day_button:
    'inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-medium text-neutral-700 transition-colors hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:text-neutral-200 dark:hover:bg-sky-950/60 dark:hover:text-sky-300',
  selected:
    '[&>button]:bg-sky-600 [&>button]:text-white [&>button]:font-semibold [&>button]:hover:bg-sky-700 [&>button]:hover:text-white dark:[&>button]:bg-sky-500 dark:[&>button]:text-slate-950 dark:[&>button]:hover:bg-sky-400',
  today:
    '[&>button]:ring-1 [&>button]:ring-sky-500/60 [&>button]:font-semibold dark:[&>button]:ring-sky-400/60',
  outside:
    '[&>button]:text-neutral-300 [&>button]:hover:text-neutral-500 dark:[&>button]:text-neutral-600 dark:[&>button]:hover:text-neutral-400',
  disabled: '[&>button]:pointer-events-none [&>button]:opacity-35',
  hidden: 'invisible',
};

export const datePickerTimeInputStyles =
  'w-12 rounded-lg border border-neutral-200/90 bg-neutral-50/80 px-1.5 py-1 text-center font-mono text-xs font-semibold text-neutral-800 outline-none ' +
  'focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 ' +
  'dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-100 dark:focus:border-sky-400';
