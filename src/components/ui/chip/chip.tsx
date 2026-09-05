'use client';

import type { ChipProps } from './types';

import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';
import {
  chipBaseStyles,
  chipSizeStyles,
  getChipVariantStyles,
} from './chip.variants';

export function Chip({
  children,
  selected = false,
  onClick,
  disabled = false,
  title,
  size = 'xs',
  icon: Icon,
  showCheck = false,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        chipBaseStyles,
        chipSizeStyles[size],
        getChipVariantStyles(selected),
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {Icon && <Icon size={size === 'xs' ? 14 : 16} className="shrink-0" />}
      {children}
      {selected && showCheck && (
        <Check
          size={size === 'xs' ? 12 : 14}
          className="shrink-0 text-sky-500 dark:text-sky-400"
        />
      )}
    </button>
  );
}
