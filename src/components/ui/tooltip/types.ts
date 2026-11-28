import type { Placement } from '@floating-ui/react';
import type { ReactElement, ReactNode } from 'react';

export type TooltipVariant =
  | 'default'
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

export type TooltipTouchBehavior = 'long-press' | 'tap' | 'none';

/**
 * Props for TooltipRoot which manages hover delay state, touch gesture behavior, and open state.
 */
export type TooltipRootProps = {
  /** Target trigger element and popup content */
  children: ReactNode;
  /** Hover delay before opening and closing in ms, or number for both */
  delay?: TooltipDelay;
  /** Touch interaction mode on touch/pen devices (default: 'long-press') */
  touchBehavior?: TooltipTouchBehavior;
  /** Press duration in ms before revealing tooltip on touch devices (default: 450) */
  longPressDelay?: number;
  /** Auto-hide delay in ms after releasing a long-press tooltip (default: 1200) */
  touchAutoHideDelay?: number;
};

/**
 * Props for TooltipTrigger which binds hover/focus/touch events to the trigger element.
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
  /** Color theme variant for the tooltip (default: 'default') */
  variant?: TooltipVariant;
  /** Additional CSS class names for the popup */
  className?: string;
  /** Additional CSS class names for the arrow */
  arrowClassName?: string;
  /** Tooltip body content */
  children: ReactNode;
};
