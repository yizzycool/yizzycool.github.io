'use client';

import type { ButtonSize } from '@/types/common/button';
import type { Rounded } from '@/types/common';
import type { SnackbarItem, SnackbarProps } from './types';

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
import {
  snackbarRoundedMap,
  snackbarSizes,
  snackbarVariants,
} from './snackbar.variants';

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
        snackbarVariants[itemVariant],
        snackbarSizes[size],
        snackbarRoundedMap[rounded],
        bordered && 'border',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-2">
        {Icon && <Icon size={16} className="shrink-0" />}
        <div className="flex-1 break-words text-xs font-semibold leading-snug">
          {item.content}
        </div>
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
