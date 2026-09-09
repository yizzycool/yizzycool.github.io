'use client';

import type { SurfaceProps } from './types';

import { cn } from '@/utils/cn';
import {
  DEFAULT_SURFACE_ANIMATION,
  DEFAULT_SURFACE_BORDERED,
  DEFAULT_SURFACE_HOVER_EFFECT,
  DEFAULT_SURFACE_ROUNDED,
  DEFAULT_SURFACE_VARIANT,
} from './constants';
import {
  getSurfaceVariants,
  surfaceAnimations,
  surfaceBaseStyles,
  surfaceRoundedMap,
} from './surface.variants';

export function Surface({
  ref,
  children,
  variant = DEFAULT_SURFACE_VARIANT,
  rounded = DEFAULT_SURFACE_ROUNDED,
  hoverEffect = DEFAULT_SURFACE_HOVER_EFFECT,
  bordered = DEFAULT_SURFACE_BORDERED,
  animation = DEFAULT_SURFACE_ANIMATION,
  className = '',
  ...restProps
}: SurfaceProps) {
  const variants = getSurfaceVariants(hoverEffect);

  return (
    <div
      ref={ref}
      className={cn(
        surfaceBaseStyles,
        bordered && 'border',
        variants[variant] || variants.default,
        surfaceRoundedMap[rounded] || surfaceRoundedMap.xl,
        surfaceAnimations[animation],
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}
