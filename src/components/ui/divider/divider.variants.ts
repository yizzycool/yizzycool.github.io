import type { DividerOrientation } from './types';

export const dividerBaseStyles = 'bg-neutral-200 dark:bg-neutral-700';

export const dividerOrientationStyles: Record<DividerOrientation, string> = {
  vertical: 'w-px self-stretch',
  horizontal: 'h-px w-full',
};
