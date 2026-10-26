import type { InsetGroupProps, InsetGroupRowProps } from './types';

import { cn } from '@/utils/cn';

/**
 * Standard Inset Group Container:
 * - Glassmorphism translucent background (bg-white/70 backdrop-blur-md dark:bg-neutral-900/60)
 * - Subtle border (border-neutral-200/80 dark:border-neutral-800)
 * - Unified divider (divide-y divide-neutral-200/70 dark:divide-neutral-800/60)
 * - Lightweight shadow (shadow-2xs)
 */
export function InsetGroup({
  children,
  rounded = 'xl',
  className,
  ...props
}: InsetGroupProps) {
  return (
    <div
      className={cn(
        'shadow-2xs divide-y divide-neutral-200/70 overflow-hidden border border-neutral-200/80 bg-white/70 backdrop-blur-md',
        'dark:divide-neutral-800/60 dark:border-neutral-800 dark:bg-neutral-900/60',
        rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Standard Custom Row Container:
 * Used for custom formatted rows (such as ColorSpaceItem, OverviewResultItem)
 * Provides consistent padding, transition, and hover background color.
 */
export function InsetGroupRow({
  children,
  hoverable = true,
  className,
  ...props
}: InsetGroupRowProps) {
  return (
    <div
      className={cn(
        'group p-3.5 transition-colors',
        hoverable && 'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
