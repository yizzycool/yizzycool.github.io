import type { SwitchSize } from './types';

export const switchSizeStyles: Record<
  SwitchSize,
  {
    track: string;
    knob: string;
    iconSize: number;
    textSize: string;
    gap: string;
  }
> = {
  xs: {
    track: 'h-4 w-7',
    knob: 'h-3 w-3 left-0.5 top-0.5 peer-checked:translate-x-3',
    iconSize: 12,
    textSize: 'text-xs',
    gap: 'gap-1.5',
  },
  sm: {
    track: 'h-5 w-9',
    knob: 'h-4 w-4 left-0.5 top-0.5 peer-checked:translate-x-4',
    iconSize: 14,
    textSize: 'text-xs sm:text-sm',
    gap: 'gap-2',
  },
  base: {
    track: 'h-6 w-11',
    knob: 'h-5 w-5 left-0.5 top-0.5 peer-checked:translate-x-5',
    iconSize: 16,
    textSize: 'text-sm sm:text-base',
    gap: 'gap-2.5',
  },
  lg: {
    track: 'h-7 w-13',
    knob: 'h-6 w-6 left-0.5 top-0.5 peer-checked:translate-x-6',
    iconSize: 18,
    textSize: 'text-base',
    gap: 'gap-3',
  },
};
