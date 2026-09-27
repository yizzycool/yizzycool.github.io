import type { Placement } from '@floating-ui/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { TooltipDelay, TooltipVariant } from '../tooltip/types';

export type InfoTooltipSize = 'xs' | 'sm' | 'base';

export type InfoTooltipProps = {
  /** Optional title shown in bold above the content */
  title?: ReactNode;
  /** Primary tooltip content (alternative to children) */
  content?: ReactNode;
  /** Custom children to render inside the tooltip popup (takes precedence over content) */
  children?: ReactNode;
  /** Tooltip popup placement direction (default: 'top') */
  placement?: Placement;
  /** Icon and button size scale (default: 'sm') */
  size?: InfoTooltipSize;
  /** Custom icon component (default: Lucide Info) */
  icon?: LucideIcon;
  /** Stroke width for the rendered icon */
  iconStrokeWidth?: number;
  /** Accessible label for the trigger button */
  ariaLabel?: string;
  /** Custom class name applied to the trigger button */
  className?: string;
  /** Custom class name applied to the tooltip popup */
  popupClassName?: string;
  /** Tooltip visual color theme (default: 'dark') */
  variant?: TooltipVariant;
  /** Delay configuration in ms before showing or hiding the tooltip */
  delay?: TooltipDelay;
  /** Whether to show a directional arrow (default: true) */
  showArrow?: boolean;
};
