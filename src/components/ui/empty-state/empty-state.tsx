'use client';

import type { EmptyStateProps } from './types';

import { cn } from '@/utils/cn';
import {
  emptyStateBaseStyles,
  emptyStateSizeStyles,
  emptyStateToneStyles,
  emptyStateVariantStyles,
} from './empty-state.variants';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'plain',
  tone = 'neutral',
  size = 'md',
  iconVariant = 'bare',
  iconClassName,
  className,
}: EmptyStateProps) {
  const sizeStyles = emptyStateSizeStyles[size];
  const toneStyles = emptyStateToneStyles[tone];

  return (
    <div
      className={cn(
        emptyStateBaseStyles,
        emptyStateVariantStyles[variant],
        sizeStyles.container,
        className
      )}
    >
      {Icon &&
        (iconVariant === 'tinted' ? (
          <div
            className={cn(
              'flex items-center justify-center',
              sizeStyles.iconBox,
              toneStyles.iconBox
            )}
          >
            <Icon size={sizeStyles.iconSize} className={iconClassName} />
          </div>
        ) : (
          <Icon
            size={sizeStyles.iconSize}
            className={cn(toneStyles.icon, iconClassName)}
          />
        ))}
      {title && (
        <p className={cn(sizeStyles.title, toneStyles.title)}>{title}</p>
      )}
      {description && (
        <p className={cn(sizeStyles.description, toneStyles.description)}>
          {description}
        </p>
      )}
      {action && <div className={sizeStyles.action}>{action}</div>}
    </div>
  );
}
