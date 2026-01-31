'use client';

import clsx from 'clsx';

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
      className={clsx(
        'border-neutral-200 dark:border-neutral-700',
        orientation === 'vertical' ? 'h-full border-l' : 'w-full border-t',
        className
      )}
    />
  );
}
