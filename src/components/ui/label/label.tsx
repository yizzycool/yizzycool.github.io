'use client';

import type { LabelProps } from './types';

import { cn } from '@/utils/cn';
import { labelBaseStyles } from './label.variants';

export function Label({
  htmlFor,
  icon: Icon,
  className = '',
  children,
}: LabelProps) {
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cn(labelBaseStyles, className)}>
      {!!Icon && <Icon className="inline-block" size={16} />}
      <span>{children}</span>
    </label>
  ) : (
    <div className={cn(labelBaseStyles, className)}>
      {!!Icon && <Icon className="inline-block" size={16} />}
      <span>{children}</span>
    </div>
  );
}
