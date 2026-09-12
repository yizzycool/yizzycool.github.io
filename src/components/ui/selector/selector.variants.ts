export const selectorTriggerStyles =
  'relative flex w-full items-center justify-between rounded-xl border px-4 py-2.5 font-mono text-sm leading-relaxed outline-none ' +
  'shadow-2xs border-neutral-200/90 bg-white/80 text-slate-800 backdrop-blur-md transition-all duration-200 ' +
  'hover:border-neutral-300 hover:bg-white dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100 ' +
  'dark:hover:border-neutral-600 dark:hover:bg-neutral-900/95 ' +
  'focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 ' +
  'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const selectorBaseStyles = selectorTriggerStyles;

export const selectorChevronStyles =
  'size-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500';

export const selectorMenuStyles =
  'z-50 overflow-y-auto rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 space-y-0.5 ' +
  'shadow-xl shadow-neutral-900/10 backdrop-blur-xl outline-none ' +
  'dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:shadow-black/40';

export const selectorOptionStyles =
  'relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 font-mono text-sm ' +
  'text-slate-700 transition-colors duration-150 outline-none ' +
  'hover:bg-sky-50 hover:text-sky-700 ' +
  'dark:text-slate-200 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 ' +
  'aria-selected:bg-sky-500/10 aria-selected:font-semibold aria-selected:text-sky-600 ' +
  'dark:aria-selected:bg-sky-400/15 dark:aria-selected:text-sky-400 ' +
  'data-[focus=true]:bg-sky-50 dark:data-[focus=true]:bg-sky-950/50';

export const selectorOptionDisabledStyles =
  'cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent';
