'use client';

import type { BadgeProps } from './types';

import { cn } from '@/utils/cn';

import { badgeVariants, badgeSizes, badgeRoundedMap } from './badge.variants';
import {
  DEFAULT_BADGE_VARIANT,
  DEFAULT_BADGE_SIZE,
  DEFAULT_BADGE_ROUNDED,
} from './constants';

export function Badge({
  children,
  variant = DEFAULT_BADGE_VARIANT,
  size = DEFAULT_BADGE_SIZE,
  rounded = DEFAULT_BADGE_ROUNDED,
  bordered = false,
  className = '',
  icon: Icon,
  iconStrokeWidth = 2,
  iconClassName = '',
}: BadgeProps) {
  const currentVariant = badgeVariants[variant] || badgeVariants.neutral;
  const currentSize = badgeSizes[size] || badgeSizes.xs;
  const currentRounded = badgeRoundedMap[rounded] || badgeRoundedMap.full;

  const hasChildren = Boolean(children);

  return (
    <div
      className={cn(
        'flex w-fit items-center justify-center whitespace-nowrap font-semibold transition-colors duration-200',
        currentVariant,
        currentSize.padding(hasChildren),
        currentRounded,
        bordered && 'border',
        className
      )}
    >
      {Icon && (
        <Icon
          size={currentSize.iconSize}
          className={cn(hasChildren && currentSize.iconMargin, iconClassName)}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {children}
    </div>
  );
}
