import type { InfoTooltipSize } from './types';

export const infoTooltipButtonBaseStyles =
  'inline-flex cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:text-neutral-500 dark:hover:text-neutral-300 dark:focus-visible:ring-neutral-500';

export const infoTooltipIconSizes: Record<InfoTooltipSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  base: 'h-4 w-4',
};
