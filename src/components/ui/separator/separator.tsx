'use client';

import type { SeparatorProps } from './types';

import { cn } from '@/utils/cn';
import {
  separatorBaseStyles,
  separatorOrientationStyles,
} from './separator.variants';

export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        separatorBaseStyles,
        separatorOrientationStyles[orientation],
        // orientation === 'horizontal' &&
        //   className?.includes('-mx-') &&
        //   !/\bw-\S+/.test(className) &&
        //   'w-auto',
        className
      )}
    />
  );
}
