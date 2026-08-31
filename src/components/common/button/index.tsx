'use client';

import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { MouseEventHandler } from 'react';

import { LucideIcon } from 'lucide-react';
import { forwardRef, useMemo } from 'react';
import { isFunction } from 'lodash';

import { cn } from '@/utils/cn';

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
  hoverEffect?: boolean;
  ariaLabel?: string;
  id?: string;
  title?: string;
};

// UI Component: Button
const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
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
    hoverEffect = true,
    ariaLabel,
    ...restProps
  },
  ref
) {
  const baseStyles =
    'group flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary: cn(
      'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 border-transparent',
      !disabled && hoverEffect && 'hover:bg-slate-800 dark:hover:bg-slate-100'
    ),
    secondary: cn(
      'bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs dark:bg-neutral-900/80 dark:text-slate-200 dark:border-neutral-800',
      !disabled &&
        hoverEffect &&
        'hover:bg-white hover:border-slate-300 dark:hover:bg-neutral-800/80 dark:hover:border-neutral-700'
    ),
    ghost: cn(
      'text-slate-600 dark:text-slate-400 border-slate-300/80 dark:border-neutral-700/80',
      !disabled &&
        hoverEffect &&
        'hover:bg-slate-100/80 hover:text-slate-900 hover:border-slate-300 dark:hover:bg-neutral-800/80 dark:hover:text-white dark:hover:border-neutral-700'
    ),
    'ghost-sky': cn(
      'text-sky-600 dark:text-sky-400 border-transparent',
      !disabled &&
        hoverEffect &&
        'hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300'
    ),
    outline: cn(
      'border border-slate-200 text-slate-700 dark:border-neutral-800 dark:text-slate-300',
      !disabled &&
        hoverEffect &&
        'hover:border-slate-300 hover:bg-slate-50/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/60'
    ),
    error: cn(
      'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50',
      !disabled &&
        hoverEffect &&
        'hover:bg-rose-100/80 hover:border-rose-300 hover:text-rose-800 dark:hover:bg-rose-900/40 dark:hover:border-rose-700/60 dark:hover:text-rose-200'
    ),
    'dark-sky': cn(
      'bg-sky-600 text-white shadow-xs border-transparent dark:bg-sky-500 dark:text-white',
      !disabled && hoverEffect && 'hover:bg-sky-500 dark:hover:bg-sky-400'
    ),
    neutral: cn(
      'bg-slate-100/80 text-slate-600 border-slate-200/70 dark:bg-neutral-900/60 dark:text-slate-400 dark:border-neutral-800',
      !disabled &&
        hoverEffect &&
        'hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-neutral-800 dark:hover:text-slate-200'
    ),
    success: cn(
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
      !disabled &&
        hoverEffect &&
        'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30'
    ),
    blue: cn(
      'bg-sky-600 text-white shadow-xs border-transparent dark:bg-sky-500 dark:text-white',
      !disabled && hoverEffect && 'hover:bg-sky-500 dark:hover:bg-sky-400'
    ),
    amber: cn(
      'bg-amber-50 text-amber-600 border-amber-300 shadow-2xs dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-400',
      !disabled &&
        hoverEffect &&
        'hover:bg-amber-100/80 hover:border-amber-400 dark:hover:bg-amber-900/60 dark:hover:border-amber-700'
    ),
    surface: cn(
      'border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
      !disabled &&
        hoverEffect &&
        'hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800'
    ),
  };

  const sizes = {
    xs: cn('text-xs', !!children ? 'px-3 py-1.5' : 'p-2'),
    sm: cn('text-sm', !!children ? 'px-4 py-2' : 'p-2.5'),
    base: cn('text-base', !!children ? 'px-5 py-2.5' : 'p-3'),
    lg: cn('text-lg', !!children ? 'px-6 py-3' : 'p-3.5'),
    xl: cn('text-xl', !!children ? 'px-7 py-3.5 ' : 'p-4'),
  };

  const roundedMap = {
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
    if (disabled || !isFunction(onClick)) return;
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
      ref={ref}
      type="button"
      onClick={onButtonClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        roundedMap[rounded],
        bordered ? 'border' : '',
        className
      )}
      aria-label={ariaLabel}
      {...restProps}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={cn(iconMargin, iconClassName)}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {children}
    </button>
  );
});

export default Button;
