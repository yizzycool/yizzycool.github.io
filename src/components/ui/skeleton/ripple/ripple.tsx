import type { SkeletonProps } from './types';

import { ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  rippleBaseStyles,
  rippleIconBlockStyles,
  rippleRing1Styles,
  rippleRing2Styles,
} from './ripple.variants';

export function Ripple({ className = '' }: SkeletonProps) {
  return (
    <div className={cn(rippleBaseStyles, className)}>
      {/* Concentric expanding ripples */}
      <div className={rippleRing1Styles} />
      <div className={rippleRing2Styles} />

      {/* Central glassmorphic icon block */}
      <div className={rippleIconBlockStyles}>
        <ImageIcon className="h-6 w-6 text-indigo-500 opacity-50 dark:text-indigo-300" />
      </div>
    </div>
  );
}
