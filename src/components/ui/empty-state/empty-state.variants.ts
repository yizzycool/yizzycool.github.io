import type {
  EmptyStateSize,
  EmptyStateTone,
  EmptyStateVariant,
} from './types';

export const emptyStateBaseStyles =
  'flex flex-col items-center justify-center text-center';

export const emptyStateVariantStyles: Record<EmptyStateVariant, string> = {
  plain: '',
  dashed:
    'rounded-2xl border border-dashed border-neutral-200/90 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/20',
};

export const emptyStateSizeStyles: Record<
  EmptyStateSize,
  {
    container: string;
    iconSize: number;
    iconBox: string;
    title: string;
    description: string;
    action: string;
  }
> = {
  sm: {
    container: 'gap-1.5 px-4 py-6',
    iconSize: 24,
    iconBox: 'mb-1 rounded-xl p-2.5',
    title: 'text-xs font-semibold',
    description: 'max-w-xs text-[11px]',
    action: 'mt-2',
  },
  md: {
    container: 'gap-2 px-4 py-8',
    iconSize: 28,
    iconBox: 'mb-1 rounded-2xl p-3',
    title: 'text-sm font-medium',
    description: 'max-w-sm text-xs',
    action: 'mt-3',
  },
  lg: {
    container: 'gap-2.5 px-6 py-16',
    iconSize: 36,
    iconBox: 'mb-1.5 rounded-2xl p-4',
    title: 'text-base font-bold',
    description: 'max-w-sm text-sm',
    action: 'mt-4',
  },
};

export const emptyStateToneStyles: Record<
  EmptyStateTone,
  {
    icon: string;
    iconBox: string;
    title: string;
    description: string;
  }
> = {
  neutral: {
    icon: 'text-slate-300 dark:text-slate-600',
    iconBox:
      'bg-neutral-100 text-slate-400 dark:bg-neutral-800 dark:text-slate-500',
    title: 'text-slate-600 dark:text-slate-400',
    description: 'text-slate-400 dark:text-slate-500',
  },
  success: {
    icon: 'text-emerald-500/80 dark:text-emerald-400/80',
    iconBox:
      'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400',
    title: 'text-slate-700 dark:text-slate-300',
    description: 'text-slate-400 dark:text-slate-500',
  },
  warning: {
    icon: 'text-amber-500/80 dark:text-amber-400/80',
    iconBox:
      'bg-amber-50 text-amber-500 dark:bg-amber-950/50 dark:text-amber-400',
    title: 'text-slate-700 dark:text-slate-300',
    description: 'text-slate-400 dark:text-slate-500',
  },
  error: {
    icon: 'text-rose-500/80 dark:text-rose-400/80',
    iconBox: 'bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400',
    title: 'text-rose-600 dark:text-rose-400',
    description: 'text-slate-500 dark:text-slate-400',
  },
};
