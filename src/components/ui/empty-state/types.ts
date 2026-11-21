import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type EmptyStateVariant = 'plain' | 'dashed';

export type EmptyStateTone = 'neutral' | 'success' | 'warning' | 'error';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export type EmptyStateIconVariant = 'bare' | 'tinted';

/**
 * Props for the EmptyState component.
 */
export type EmptyStateProps = {
  /** Optional Lucide icon component rendered above the title */
  icon?: LucideIcon;
  /** Primary empty-state heading text or node */
  title?: ReactNode;
  /** Supporting helper description text or node */
  description?: ReactNode;
  /** Optional action element (e.g. Button) rendered below the description */
  action?: ReactNode;
  /** Visual container variant ('plain' for inside containers, 'dashed' for standalone areas) */
  variant?: EmptyStateVariant;
  /** Semantic color tone ('neutral' for default empty state, 'success'/'warning'/'error' for feedback states) */
  tone?: EmptyStateTone;
  /** Spacing and typography scale */
  size?: EmptyStateSize;
  /** Whether to render the icon directly ('bare') or inside a soft tinted container ('tinted') */
  iconVariant?: EmptyStateIconVariant;
  /** Additional CSS class names for the icon */
  iconClassName?: string;
  /** Additional CSS class names for the outer wrapper */
  className?: string;
};
