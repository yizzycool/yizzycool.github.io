'use client';

import type { Animation, Rounded } from '@/types/common';
import clsx from 'clsx';

type Props = {
  className?: string;
  rounded?: Rounded;
  animation?: Animation;
  children?: React.ReactNode;
};

const Roundeds = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export default function Card({
  className = '',
  rounded = 'lg',
  animation = 'none',
  children,
}: Props) {
  const animations = {
    none: '',
    'fade-in': 'animate-in fade-in duration-500',
  };

  return (
    <div
      className={clsx(
        'border p-6',
        'border-neutral-200 dark:border-neutral-700',
        'bg-white/80 dark:bg-neutral-900/80',
        animations[animation],
        Roundeds[rounded],
        className
      )}
    >
      {children}
    </div>
  );
}
