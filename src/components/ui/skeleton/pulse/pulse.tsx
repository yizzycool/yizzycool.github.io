import type { SkeletonProps } from './types';

import { cn } from '@/utils/cn';
import { pulseBaseStyles } from './pulse.variants';

export function Pulse({ className = '' }: SkeletonProps) {
  return <div className={cn(pulseBaseStyles, className)} />;
}
