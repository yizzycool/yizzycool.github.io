'use client';

import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';

import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';
import { MouseEventHandler, useMemo } from 'react';

import _isFunction from 'lodash/isFunction';

type Props = {
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
  disabled?: boolean;
};

// UI Component: Button
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'base',
  rounded = 'base',
  bordered = false,
  className = '',
  icon: Icon,
  iconStrokeWidth = 2,
  iconClassName = '',
  disabled = false,
}: Props) {
  const baseStyles =
    'group flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: clsx(
      'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-white dark:border-black',
      !disabled && 'hover:bg-neutral-800 dark:hover:bg-neutral-200'
    ),
    secondary: clsx(
      'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600',
      !disabled && 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
    ),
    ghost: clsx(
      'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
      !disabled && 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
    ),
    outline: clsx(
      'border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
      !disabled && 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
    ),
    error: clsx(
      'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-800/10 border-red-500/20',
      !disabled && 'hover:bg-red-100/90 dark:hover:bg-red-800/30'
    ),
    'dark-sky': clsx(
      'text-white bg-sky-600 dark:bg-sky-900 border-sky-500/20',
      !disabled && 'hover:bg-sky-500 dark:hover:bg-sky-800'
    ),
    neutral: clsx(
      'bg-neutral-100 border-neutral-500/20 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
      !disabled && 'hover:bg-neutral-200 dark:hover:bg-neutral-600'
    ),
    success: clsx(
      'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
      !disabled && 'hover:bg-green-400/20'
    ),
    blue: clsx(
      'bg-blue-100 border-blue-500/20  text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      !disabled && 'hover:bg-blue-50 dark:hover:bg-blue-400/10'
    ),
  };

  const sizes = {
    xs: clsx('text-xs', !!children ? 'px-3 py-1.5' : 'p-2'),
    sm: clsx('text-sm', !!children ? 'px-4 py-2' : 'p-2.5'),
    base: clsx('text-base', !!children ? 'px-5 py-2.5' : 'p-3'),
    lg: clsx('text-lg', !!children ? 'px-6 py-3' : 'p-3.5'),
    xl: clsx('text-xl', !!children ? 'px-7 py-3.5 ' : 'p-4'),
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

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled || !_isFunction(onClick)) return;
    onClick(e);
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
    <button
      onClick={onButtonClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundeds[rounded]} ${className} ${bordered ? 'border' : ''}`}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={`${iconMargin} ${iconClassName}`}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {children}
    </button>
  );
}
