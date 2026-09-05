'use client';

import type { CountBadgeProps } from './types';

import { cn } from '@/utils/cn';

import {
  countBadgeVariantStyles,
  countBadgeSizeStyles,
} from './count-badge.variants';
import {
  DEFAULT_COUNT_BADGE_VARIANT,
  DEFAULT_COUNT_BADGE_SIZE,
} from './constants';

export function CountBadge({
  count,
  max,
  variant = DEFAULT_COUNT_BADGE_VARIANT,
  size = DEFAULT_COUNT_BADGE_SIZE,
  showZero = true,
  className = '',
  children,
}: CountBadgeProps) {
  const displayValue = children ?? count;

  if (displayValue === undefined || displayValue === null) {
    return null;
  }

  if (displayValue === 0 && !showZero) {
    return null;
  }

  const formattedValue =
    typeof displayValue === 'number' && max !== undefined && displayValue > max
      ? `${max}+`
      : displayValue;

  const currentVariant =
    countBadgeVariantStyles[variant] || countBadgeVariantStyles.subtle;
  const currentSize = countBadgeSizeStyles[size] || countBadgeSizeStyles.xs;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold transition-colors duration-200',
        currentSize,
        currentVariant,
        className
      )}
    >
      {formattedValue}
    </span>
  );
}
