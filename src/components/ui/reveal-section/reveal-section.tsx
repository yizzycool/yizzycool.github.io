'use client';

import type { RevealSectionProps } from './types';

import { useRef } from 'react';

import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import { cn } from '@/utils/cn';
import {
  getRevealSectionVisibilityStyles,
  revealSectionBaseStyles,
} from './reveal-section.variants';

export function RevealSection({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { hit: isVisible } = useIntersectionObserver({
    targetRef: ref,
    threshold,
  });

  return (
    <div
      ref={ref}
      className={cn(
        revealSectionBaseStyles,
        getRevealSectionVisibilityStyles(isVisible),
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
