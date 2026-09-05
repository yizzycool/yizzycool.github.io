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

export type TooltipRootProps = {
  children: ReactNode;
  delay?: TooltipDelay;
};

export type TooltipTriggerProps = {
  children: ReactElement<Record<string, unknown>>;
};

export type TooltipPopupProps = {
  placement?: Placement;
  showArrow?: boolean;
  variant?: TooltipVariant;
  className?: string;
  arrowClassName?: string;
  children: ReactNode;
};
