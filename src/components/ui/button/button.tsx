'use client';

import type { ButtonProps } from './types';

import { cn } from '@/utils/cn';
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../tooltip';

import { BaseButton } from './base-button';

export function Button({
  title,
  tooltipPlacement = 'bottom',
  tooltipVariant = 'dark',
  tooltipDelay = { open: 200, close: 100 },
  showTooltipArrow = false,
  tooltipClassName = '',
  ...buttonProps
}: ButtonProps) {
  const baseButton = <BaseButton title={title} {...buttonProps} />;

  if (!title) {
    return baseButton;
  }

  return (
    <TooltipRoot delay={tooltipDelay}>
      <TooltipTrigger>{baseButton}</TooltipTrigger>
      <TooltipPopup
        placement={tooltipPlacement}
        variant={tooltipVariant}
        showArrow={showTooltipArrow}
        className={cn('px-2.5 py-1 text-xs font-medium', tooltipClassName)}
      >
        {title}
      </TooltipPopup>
    </TooltipRoot>
  );
}
