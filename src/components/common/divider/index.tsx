'use client';

import { cn } from '@/utils/cn';

type Props = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export default function Divider({
  orientation = 'horizontal',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'bg-neutral-200 dark:bg-neutral-700',
        orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full',
        className
      )}
    />
  );
}
