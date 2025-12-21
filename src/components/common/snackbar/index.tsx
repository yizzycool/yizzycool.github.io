'use client';

import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import clsx from 'clsx';
import { LucideIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import _isFunction from 'lodash/isFunction';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';

type Props = {
  open: boolean;
  onClose: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
  showCloseIcon?: boolean;
  position?: 'top left' | 'top right' | 'bottom left' | 'bottom right';
  offsetX?: number; // pixel
  offsetY?: number; // pixel
  timeout?: number;
  content?: string;
};

// UI Component: Snackbar
export default function Snackbar({
  open,
  variant = 'primary',
  size = 'base',
  rounded = 'base',
  bordered = false,
  className = '',
  icon: Icon,
  iconStrokeWidth = 2,
  iconClassName = '',
  showCloseIcon = true,
  position = 'bottom right',
  offsetX = 20,
  offsetY = 20,
  onClose = () => {},
  timeout = 3000,
  content = '',
}: Props) {
  const [message, setMessage] = useState(content);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getSlideUpClass } = useGetTransitionClass({ loaded: open });

  // Close snackbar after <timeout> ms
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, timeout);

    return () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
    };
  }, [open]);

  // Sync `message` from `content` if content is not empty
  useEffect(() => {
    if (!content) return;
    setMessage(content);
  }, [content]);

  const baseStyles =
    'fixed z-50 flex items-center justify-center transition-all duration-300 font-medium backdrop-blur-md';

  const positions = {
    'top left': { top: `${offsetY}px`, left: `${offsetX}px` },
    'top right': { top: `${offsetY}px`, right: `${offsetX}px` },
    'bottom left': { bottom: `${offsetY}px`, left: `${offsetX}px` },
    'bottom right': { bottom: `${offsetY}px`, right: `${offsetX}px` },
  };

  const variants = {
    primary: clsx(
      'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-white dark:border-black'
    ),
    secondary: clsx(
      'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-600 dark:border-neutral-400'
    ),
    ghost: clsx('text-neutral-600 dark:text-neutral-400 border-neutral-500/20'),
    outline: clsx(
      'border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'
    ),
    error: clsx(
      'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-800/10 border-red-500/20'
    ),
    'dark-sky': clsx('text-white bg-sky-600 dark:bg-sky-900 border-sky-500/20'),
    neutral: clsx(
      'bg-neutral-100 border-neutral-500/20 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
    ),
    success: clsx(
      'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
    ),
    blue: clsx(
      'bg-blue-100 border-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
    ),
  };

  const sizes = {
    xs: 'text-xs px-3 py-1.5',
    sm: 'text-sm px-4 py-2',
    base: 'text-base px-5 py-2.5',
    lg: 'text-lg px-6 py-3',
    xl: 'text-xl px-7 py-3.5 ',
  };

  const roundeds = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
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
    if (size === 'xl') return 'mr-4';
    if (size === 'lg') return 'mr-3';
    if (size === 'base') return 'mr-3';
    if (size === 'sm') return 'mr-2';
    if (size === 'xs') return 'mr-2';
  }, [size]);

  // if (!open) return null;

  return (
    <div
      className={clsx(
        getSlideUpClass(),
        baseStyles,
        variants[variant],
        sizes[size],
        roundeds[rounded],
        className,
        bordered && 'border',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      style={positions[position]}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={clsx(iconMargin, iconClassName)}
          strokeWidth={iconStrokeWidth}
        />
      )}
      <p className="flex-1 text-sm font-medium">{message}</p>
      {showCloseIcon && (
        <X size={16} className="ml-4 cursor-pointer" onClick={onClose} />
      )}
    </div>
  );
}
