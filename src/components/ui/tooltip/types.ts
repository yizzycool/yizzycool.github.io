import type { Placement } from '@floating-ui/react';
import type { ReactElement, ReactNode } from 'react';

export type TooltipVariant =
  | 'card'
  | 'dark'
  | 'light'
  | 'accent'
  | 'inverse'
  | 'raw';

export type TooltipDelay =
  | number
  | {
      open?: number;
      close?: number;
    };

/**
 * Props for TooltipRoot which manages hover delay state and open state.
 */
export type TooltipRootProps = {
  /** Target trigger element and popup content */
  children: ReactNode;
  /** Hover delay before opening and closing in ms, or number for both */
  delay?: TooltipDelay;
};

/**
 * Props for TooltipTrigger which binds hover/focus events to the trigger element.
 */
export type TooltipTriggerProps = {
  /** Single child element to attach tooltip events and ref to */
  children: ReactElement<Record<string, unknown>>;
};

/**
 * Props for TooltipPopup which renders the floating tooltip box.
 */
export type TooltipPopupProps = {
  /** Placement direction relative to the trigger (default: 'bottom') */
  placement?: Placement;
  /** Whether to show a decorative pointer arrow */
  showArrow?: boolean;
  /** Color theme variant for the tooltip (default: 'dark') */
  variant?: TooltipVariant;
  /** Additional CSS class names for the popup */
  className?: string;
  /** Additional CSS class names for the arrow */
  arrowClassName?: string;
  /** Tooltip body content */
  children: ReactNode;
};
