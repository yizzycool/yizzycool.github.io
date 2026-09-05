'use client';

import type { DividerProps } from './types';

import { cn } from '@/utils/cn';
import {
  dividerBaseStyles,
  dividerOrientationStyles,
} from './divider.variants';

export function Divider({
  orientation = 'horizontal',
  className,
}: DividerProps) {
  return (
    <div
      className={cn(
        dividerBaseStyles,
        dividerOrientationStyles[orientation],
        className
      )}
    />
  );
}
