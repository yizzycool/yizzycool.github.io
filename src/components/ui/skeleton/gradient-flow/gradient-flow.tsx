import type { SkeletonProps } from './types';

import { cn } from '@/utils/cn';
import { gradientFlowBaseStyles } from './gradient-flow.variants';

export function GradientFlow({ className = '' }: SkeletonProps) {
  return <div className={cn(gradientFlowBaseStyles, className)} />;
}
