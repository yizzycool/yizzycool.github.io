'use client';

import type { Rounded } from '@/types/common';
import type { BadgeSize, BadgeVariant } from '@/types/common/badge';

import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

type Props = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'xs',
  rounded = 'full',
  bordered = false,
  className = '',
  icon: Icon,
  iconStrokeWidth = 2,
  iconClassName = '',
}: Props) {
  const baseStyles =
    'w-fit flex items-center justify-center transition-all duration-200 font-semibold whitespace-nowrap';

  const variants = {
    primary:
      'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-500/20',
    secondary:
      'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-600 dark:border-neutral-400',
    ghost: 'text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
    outline:
      'border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
    error:
      'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-800/10 border-red-500/20',
    'dark-sky':
      'text-sky-600 dark:text-sky-400 bg-sky-600/10 border-sky-500/20',
    neutral:
      'bg-neutral-100 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    success:
      'bg-green-400/10 border-green-500/20 text-green-900/70 dark:text-green-400',
    blue: 'bg-blue-100 border-blue-500/20 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400',
  };

  const sizes = {
    xs: clsx('text-xs', !!children ? 'px-2 py-0.5' : 'p-1'),
    sm: clsx('text-sm', !!children ? 'px-3 py-1' : 'p-1.5'),
    base: clsx('text-base', !!children ? 'px-4 py-1.5' : 'p-2'),
    lg: clsx('text-lg', !!children ? 'px-5 py-2' : 'p-2.5'),
    xl: clsx('text-xl', !!children ? 'px-6 py-2.5 ' : 'p-3'),
  };

  const roundeds = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const iconSize = useMemo(() => {
    if (size === 'xl') return 24;
    if (size === 'lg') return 20;
    if (size === 'base') return 18;
    if (size === 'sm') return 16;
    if (size === 'xs') return 12;
    return 12;
  }, [size]);

  const iconMargin = useMemo(() => {
    if (!children) return '';
    if (size === 'xl') return 'mr-4';
    if (size === 'lg') return 'mr-3';
    if (size === 'base') return 'mr-3';
    if (size === 'sm') return 'mr-2';
    if (size === 'xs') return 'mr-2';
  }, [children, size]);

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundeds[rounded]} ${bordered ? 'border' : ''} ${className} `}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={`${iconMargin} ${iconClassName}`}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {children}
    </div>
  );
}
