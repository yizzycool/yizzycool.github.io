import type { BuyMeACoffeeVariant } from './types';

export const buyMeACoffeeContainerVariants: Record<
  BuyMeACoffeeVariant,
  string
> = {
  compact:
    'group flex h-10 w-full items-center justify-between gap-2.5 rounded-xl border border-neutral-200/80 bg-white/75 px-3 text-left shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-amber-300/80 hover:bg-amber-50/60 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-amber-500/35 dark:hover:bg-amber-950/30',
  card: 'group flex w-full items-center gap-3 rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/85 via-white/85 to-orange-50/50 px-3.5 py-3 text-left shadow-sm backdrop-blur-md transition-all duration-200 hover:border-amber-300 hover:shadow-md dark:border-amber-500/20 dark:from-amber-950/35 dark:via-neutral-900/70 dark:to-orange-950/25 dark:hover:border-amber-500/40',
};

export const buyMeACoffeeIconBadgeVariants: Record<
  BuyMeACoffeeVariant,
  string
> = {
  compact:
    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600 transition-transform duration-200 group-hover:scale-105 dark:bg-amber-500/15 dark:text-amber-400',
  card: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-600 shadow-2xs transition-transform duration-200 group-hover:scale-105 dark:bg-amber-500/15 dark:text-amber-400',
};

export const buyMeACoffeeArrowStyles =
  'h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-neutral-500 dark:group-hover:text-amber-400';
