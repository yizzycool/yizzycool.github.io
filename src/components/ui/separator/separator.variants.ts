import type { SeparatorOrientation } from './types';

export const separatorBaseStyles = 'bg-neutral-200 dark:bg-neutral-700';

export const separatorOrientationStyles: Record<SeparatorOrientation, string> =
  {
    vertical: 'w-px',
    horizontal: 'h-px',
  };
