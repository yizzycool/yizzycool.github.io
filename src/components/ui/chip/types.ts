import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Props for the selectable Chip / Filter Tag component.
 */
export type ChipProps = {
  /** Label content */
  children?: ReactNode;
  /** Whether the chip is in a selected state */
  selected?: boolean;
  /** Click callback */
  onClick?: () => void;
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Tooltip or title attribute */
  title?: string;
  /** Size scale (default: 'sm') */
  size?: ChipSize;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Whether to show a checkmark when selected */
  showCheck?: boolean;
  /** Additional CSS class names */
  className?: string;
};
