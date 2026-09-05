import type { SkeletonProps } from './types';

import { cn } from '@/utils/cn';
import { shimmerBaseStyles, shimmerSweepStyles } from './shimmer.variants';

export function Shimmer({ className = '' }: SkeletonProps) {
  return (
    <div className={cn(shimmerBaseStyles, className)}>
      <div
        className={shimmerSweepStyles}
        style={{
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
        }}
      />
    </div>
  );
}
