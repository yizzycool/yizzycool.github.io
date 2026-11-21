'use client';

import type { FeaturePanelSide } from './types';

import { Flame } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ToolNavBadgeProps = {
  badge?: string;
  side: FeaturePanelSide;
};

export default function ToolNavBadge({ badge, side }: ToolNavBadgeProps) {
  if (!badge) {
    return null;
  }

  if (badge === 'Popular') {
    const flameIndicator = (
      <span
        aria-label="Popular"
        className="ml-auto inline-flex shrink-0 items-center justify-center"
      >
        <Flame className="h-3.5 w-3.5 fill-orange-500/20 text-orange-500 dark:fill-orange-400/20 dark:text-orange-400" />
      </span>
    );

    if (side === 'headerToolsSelector') {
      return flameIndicator;
    }

    return (
      <TooltipRoot delay={{ open: 250, close: 80 }}>
        <TooltipTrigger>{flameIndicator}</TooltipTrigger>
        <TooltipPopup
          placement="right"
          showArrow
          className="px-2 py-1 text-xs font-medium"
        >
          Popular
        </TooltipPopup>
      </TooltipRoot>
    );
  }

  if (badge === 'New') {
    return (
      <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        New
      </span>
    );
  }

  return (
    <Badge
      variant="blue"
      size="xs"
      bordered
      className="ml-auto shrink-0 px-1.5 py-0 text-[10px]"
    >
      {badge}
    </Badge>
  );
}
