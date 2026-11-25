'use client';

import type { BuyMeACoffeeProps } from './types';

import { ArrowUpRight, Coffee } from 'lucide-react';

import { cn } from '@/utils/cn';

import {
  buyMeACoffeeArrowStyles,
  buyMeACoffeeContainerVariants,
  buyMeACoffeeIconBadgeVariants,
} from './buy-me-a-coffee.variants';

/**
 * Native Light/Dark themed Buy Me a Coffee support link matching the site's design system.
 */
export function BuyMeACoffee({
  variant = 'compact',
  title = 'Buy me a coffee',
  subtitle = 'Support free & ad-free tools',
  className,
}: BuyMeACoffeeProps) {
  return (
    <a
      href="https://www.buymeacoffee.com/yizzypeasy"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      className={cn(buyMeACoffeeContainerVariants[variant], className)}
    >
      <span className={buyMeACoffeeIconBadgeVariants[variant]}>
        <Coffee
          className={variant === 'card' ? 'h-4 w-4' : 'h-3.5 w-3.5'}
          strokeWidth={2}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate font-semibold text-neutral-800 dark:text-neutral-100',
            variant === 'card' ? 'text-sm leading-tight' : 'text-xs'
          )}
        >
          {title}
        </span>
        {variant === 'card' && subtitle && (
          <span className="mt-0.5 block truncate text-[11px] text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </span>
        )}
      </span>

      <ArrowUpRight className={buyMeACoffeeArrowStyles} />
    </a>
  );
}
