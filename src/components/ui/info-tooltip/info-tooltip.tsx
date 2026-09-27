'use client';

import { Info } from 'lucide-react';

import type { InfoTooltipProps } from './types';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import {
  DEFAULT_INFO_TOOLTIP_DELAY,
  DEFAULT_INFO_TOOLTIP_PLACEMENT,
  DEFAULT_INFO_TOOLTIP_SHOW_ARROW,
  DEFAULT_INFO_TOOLTIP_SIZE,
} from './constants';
import {
  infoTooltipButtonBaseStyles,
  infoTooltipIconSizes,
} from './info-tooltip.variants';

export function InfoTooltip({
  title,
  content,
  children,
  placement = DEFAULT_INFO_TOOLTIP_PLACEMENT,
  size = DEFAULT_INFO_TOOLTIP_SIZE,
  icon: Icon = Info,
  iconStrokeWidth,
  ariaLabel,
  className,
  popupClassName,
  variant,
  delay = DEFAULT_INFO_TOOLTIP_DELAY,
  showArrow = DEFAULT_INFO_TOOLTIP_SHOW_ARROW,
}: InfoTooltipProps) {
  const popupContent = children ?? (
    <div>
      {title && <div className="font-semibold text-white">{title}</div>}
      {content && (
        <div className={cn(title && 'mt-0.5 text-neutral-300')}>{content}</div>
      )}
    </div>
  );

  return (
    <TooltipRoot delay={delay}>
      <TooltipTrigger>
        <button
          type="button"
          aria-label={
            ariaLabel ?? (typeof title === 'string' ? title : 'Details')
          }
          className={cn(infoTooltipButtonBaseStyles, className)}
        >
          <Icon
            className={infoTooltipIconSizes[size]}
            strokeWidth={iconStrokeWidth}
          />
        </button>
      </TooltipTrigger>
      <TooltipPopup
        placement={placement}
        showArrow={showArrow}
        variant={variant}
        className={cn(
          'max-w-xs px-2.5 py-1.5 text-xs leading-relaxed',
          popupClassName
        )}
      >
        {popupContent}
      </TooltipPopup>
    </TooltipRoot>
  );
}
