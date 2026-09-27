import type { TooltipDelay } from '../tooltip/types';
import type { InfoTooltipSize } from './types';

export const DEFAULT_INFO_TOOLTIP_SIZE: InfoTooltipSize = 'sm';

export const DEFAULT_INFO_TOOLTIP_DELAY: TooltipDelay = {
  open: 150,
  close: 100,
};

export const DEFAULT_INFO_TOOLTIP_PLACEMENT = 'top' as const;

export const DEFAULT_INFO_TOOLTIP_SHOW_ARROW = true;
