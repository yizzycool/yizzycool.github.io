import type { CheckboxIconStyle, CheckboxTheme } from './types';

import { cn } from '@/utils/cn';

export const checkboxBaseWrapperStyles = 'text-left';

export const checkboxThemeWrappers: Record<CheckboxTheme, string> = {
  base: 'space-y-4',
  card: 'grid grid-cols-1 gap-4',
  list: cn(
    'overflow-hidden rounded-xl',
    'divide-y divide-neutral-100 dark:divide-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'bg-white dark:bg-neutral-900'
  ),
};

export const checkboxThemeLabels: Record<CheckboxTheme, string> = {
  base: 'flex items-center space-x-3 cursor-pointer group',
  card: cn(
    'relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all overflow-hidden',
    'border-2 border-neutral-200 dark:border-neutral-700',
    'hover:border-neutral-400 dark:hover:border-neutral-600',
    'peer-checked:border-neutral-900 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-900/50'
  ),
  list: cn(
    'group flex cursor-pointer items-center justify-between p-4',
    'transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
  ),
};

export const checkboxIconStyles: Record<CheckboxIconStyle, string> = {
  tick: 'rounded checked:bg-neutral-900 dark:checked:bg-white',
  circle: 'rounded-full',
  rounded: 'rounded-md',
};
