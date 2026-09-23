import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, MouseEventHandler, ReactNode, Ref } from 'react';
import type { Placement } from '@floating-ui/react';
import type { TooltipDelay, TooltipVariant } from '../tooltip/types';

export type { ButtonVariant, ButtonSize } from '@/types/common/button';

/**
 * Core props for the native button element rendering (BaseButton).
 */
export type BaseButtonProps = {
  /** Optional React ref forwarded to the native button element */
  ref?: Ref<HTMLButtonElement>;
  /** Button content / children nodes */
  children?: ReactNode;
  /** Click event callback */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Visual style variant (default: 'primary') */
  variant?: ButtonVariant;
  /** Size scale of the button (default: 'base') */
  size?: ButtonSize;
  /** Border radius scale (default: 'lg') */
  rounded?: Rounded;
  /** Whether to render an explicit border */
  bordered?: boolean;
  /** Custom CSS classes for the button */
  className?: string;
  /** Optional Lucide icon to display inside the button */
  icon?: LucideIcon;
  /** Stroke width for the rendered icon */
  iconStrokeWidth?: number;
  /** Custom CSS class names applied directly to the icon */
  iconClassName?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to enable hover scaling / color transition effects */
  hoverEffect?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** HTML id attribute */
  id?: string;
  /** Tooltip title or button text description (also sets aria-label if ariaLabel is omitted) */
  title?: string;
  /** Custom inline style properties */
  style?: CSSProperties;
};

/**
 * Props for the high-level Button component, extending BaseButton with Tooltip features.
 */
export type ButtonProps = BaseButtonProps & {
  /** Floating placement direction for the tooltip when title is provided (default: 'bottom') */
  tooltipPlacement?: Placement;
  /** Visual color theme of the tooltip popup (default: 'dark') */
  tooltipVariant?: TooltipVariant;
  /** Delay configuration in ms before showing or hiding the tooltip */
  tooltipDelay?: TooltipDelay;
  /** Whether to show a directional arrow pointing to the button on the tooltip */
  showTooltipArrow?: boolean;
  /** Additional custom class names for the tooltip popup container */
  tooltipClassName?: string;
};
