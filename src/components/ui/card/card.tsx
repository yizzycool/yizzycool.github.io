'use client';

import type { CardProps } from './types';

import { cn } from '@/utils/cn';
import {
  cardAnimations,
  cardBaseStyles,
  cardRoundedMap,
} from './card.variants';

export function Card({
  ref,
  id,
  className = '',
  rounded = '2xl',
  animation = 'none',
  children,
  onClick,
}: CardProps) {
  return (
    <div
      ref={ref}
      id={id}
      onClick={onClick}
      className={cn(
        cardBaseStyles,
        cardAnimations[animation],
        cardRoundedMap[rounded],
        className
      )}
    >
      {children}
    </div>
  );
}
