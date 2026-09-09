export const baseDialogWrapperStyles =
  'inset-0 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12';

export const baseDialogBackdropStyles =
  'absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40';

export const baseDialogPanelStyles =
  'relative flex max-h-full w-fit max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl ' +
  'bg-white dark:bg-[#111] ' +
  'border border-neutral-200 dark:border-neutral-600';

export const dialogMotionVariants = {
  open: { opacity: 1, scale: 1 },
  closed: { opacity: 0, scale: 0.95 },
};
