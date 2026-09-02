import type { ReactNode } from 'react';

export type CountBadgeVariant =
  | 'subtle'
  | 'inverted'
  | 'subtle-inverted'
  | 'sky'
  | 'solid'
  | 'error'
  | 'neutral'
  | 'ghost';

export type CountBadgeSize = 'xs' | 'sm' | 'base';

export type CountBadgeProps = {
  /** The count number or string to display */
  count?: number | string;
  /** Maximum number to display. Values exceeding max will render `${max}+` */
  max?: number;
  /** Visual variant style */
  variant?: CountBadgeVariant;
  /** Size of the count badge */
  size?: CountBadgeSize;
  /** Whether to show the badge when count is 0. Defaults to true. */
  showZero?: boolean;
  className?: string;
  children?: ReactNode;
};
