export const scrollToBottomBaseStyles =
  'group fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out ' +
  'border-neutral-200/80 bg-white/70 text-slate-800 shadow-neutral-200/40 hover:bg-white dark:border-neutral-400/80 dark:bg-neutral-950/70 dark:text-slate-200 dark:shadow-black/50 dark:hover:bg-neutral-900 ' +
  'hover:translate-y-1 active:scale-95';

export const getScrollToBottomVisibilityStyles = (isVisible: boolean) =>
  isVisible
    ? 'pointer-events-auto translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-4 opacity-0';

export const scrollToBottomIconBaseStyles =
  'h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5';
