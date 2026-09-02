'use client';

import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { SnackbarItem } from './use-snackbar';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import useIsClient from '@/hooks/lifecycle/use-is-client';

export type SnackbarProps = {
  /** Multi-toast queue */
  snackbars: SnackbarItem[];
  /** Callback to close a snackbar by id */
  onClose: (id: string) => void;
  /** Toast container screen position (default: 'top right') */
  position?: 'top left' | 'top right' | 'bottom left' | 'bottom right';
  /** Toast padding and text size (default: 'base') */
  size?: ButtonSize;
  /** Rounded corner style (default: 'base') */
  rounded?: Rounded;
  /** Whether to render border (default: true) */
  bordered?: boolean;
  /** Additional container css class */
  className?: string;
  /** Screen horizontal offset in pixels (default: 20) */
  offsetX?: number;
  /** Screen vertical offset in pixels (default: 20) */
  offsetY?: number;
};

const variants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-sky-600 text-white dark:bg-sky-500 dark:text-white border-sky-500/30'
  ),
  secondary: cn(
    'bg-neutral-100 text-slate-900 dark:bg-neutral-800 dark:text-slate-100 border-neutral-600 dark:border-neutral-400'
  ),
  ghost: cn('text-slate-600 dark:text-slate-400 border-neutral-500/20'),
  'ghost-sky': cn(
    'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800'
  ),
  outline: cn(
    'border border-neutral-200 text-slate-700 dark:border-neutral-700 dark:text-slate-300'
  ),
  error: cn(
    'text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/70 border-red-500/30'
  ),
  'dark-sky': cn('text-white bg-sky-600 dark:bg-sky-900 border-sky-500/20'),
  neutral: cn(
    'bg-neutral-100 border-neutral-500/20 text-slate-600 dark:bg-neutral-700 dark:text-slate-400'
  ),
  success: cn(
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  ),
  blue: cn(
    'bg-blue-100 border-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
  ),
  amber: cn(
    'bg-amber-100/90 border-amber-300 text-amber-800 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-300'
  ),
  surface: cn(
    'border border-slate-200 bg-white text-slate-800 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
  ),
};

const sizes: Record<ButtonSize, string> = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  base: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
  xl: 'text-lg px-6 py-3.5',
};

const roundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded-xl',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export function Snackbar({
  snackbars,
  onClose,
  position = 'top right',
  size = 'base',
  rounded = 'base',
  bordered = true,
  className = '',
  offsetX = 20,
  offsetY = 20,
}: SnackbarProps) {
  const isClient = useIsClient();

  if (!isClient) return null;

  const isTop = position.startsWith('top');
  const isRight = position.endsWith('right');

  const positionsStyle = {
    'top left': { top: `${offsetY + 68}px`, left: `${offsetX}px` },
    'top right': { top: `${offsetY + 68}px`, right: `${offsetX}px` },
    'bottom left': { bottom: `${offsetY}px`, left: `${offsetX}px` },
    'bottom right': { bottom: `${offsetY}px`, right: `${offsetX}px` },
  };

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-[70] flex flex-col gap-2.5',
        isRight ? 'items-end' : 'items-start'
      )}
      style={{
        ...positionsStyle[position],
        maxWidth: `calc(100% - ${2 * offsetX}px)`,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {snackbars.map((item) => (
          <SnackbarItemView
            key={item.id}
            item={item}
            onClose={onClose}
            size={size}
            rounded={rounded}
            bordered={bordered}
            className={className}
            isTop={isTop}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function SnackbarItemView({
  item,
  onClose,
  size,
  rounded,
  bordered,
  className,
  isTop,
}: {
  item: SnackbarItem;
  onClose: (id: string) => void;
  size: ButtonSize;
  rounded: Rounded;
  bordered: boolean;
  className?: string;
  isTop: boolean;
}) {
  const itemVariant = item.variant || 'success';
  const itemTimeout = item.timeout ?? 3000;
  const showClose = item.showCloseIcon ?? true;

  useEffect(() => {
    if (itemTimeout <= 0) return;
    const timer = setTimeout(() => {
      onClose(item.id);
    }, itemTimeout);

    return () => {
      clearTimeout(timer);
    };
  }, [itemTimeout, item.id, onClose]);

  // Default icon based on variant
  const Icon = useMemo(() => {
    if (item.icon) {
      return item.icon;
    }
    if (itemVariant === 'success') {
      return CheckCircle2;
    } else if (itemVariant === 'error') {
      return AlertCircle;
    } else if (itemVariant === 'amber') {
      return AlertTriangle;
    }
    return Info;
  }, [item.icon, itemVariant]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isTop ? -16 : 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.92,
        y: isTop ? -10 : 10,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      transition={{
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'pointer-events-auto flex items-center justify-between shadow-lg backdrop-blur-md',
        'min-w-[240px] max-w-md text-left font-medium',
        variants[itemVariant],
        sizes[size],
        roundedMap[rounded],
        bordered && 'border',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-2">
        {Icon && <Icon size={16} className="shrink-0" />}
        <p className="flex-1 break-words text-xs font-semibold leading-snug">
          {item.content}
        </p>
      </div>

      {showClose && (
        <button
          onClick={() => onClose(item.id)}
          className="-mr-1 shrink-0 rounded-md p-1 opacity-70 transition-all hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}
