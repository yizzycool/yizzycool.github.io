'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonVariant } from '@/types/common/button';

import { useState, useCallback } from 'react';

export interface SnackbarItem {
  id: string;
  content: string;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  timeout?: number;
  showCloseIcon?: boolean;
}

export interface UseSnackbarOptions {
  /** Maximum number of snackbars stacked simultaneously (default: 3) */
  maxCount?: number;
  /** Default timeout in milliseconds before auto-dismiss (default: 3000) */
  defaultTimeout?: number;
  /** Default variant (default: 'success') */
  defaultVariant?: ButtonVariant;
}

export function useSnackbar(options: UseSnackbarOptions = {}) {
  const {
    maxCount = 3,
    defaultTimeout = 3000,
    defaultVariant = 'success',
  } = options;

  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSnackbars([]);
  }, []);

  const triggerSnackbar = useCallback(
    (
      contentOrOptions: string | Omit<SnackbarItem, 'id'>,
      variant?: ButtonVariant
    ) => {
      const id = `snackbar_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const newItem: SnackbarItem =
        typeof contentOrOptions === 'string'
          ? {
              id,
              content: contentOrOptions,
              variant: variant || defaultVariant,
              timeout: defaultTimeout,
            }
          : {
              id,
              variant: defaultVariant,
              timeout: defaultTimeout,
              ...contentOrOptions,
            };

      setSnackbars((prev) => {
        // If we reach maxCount, discard the oldest item and append the new one
        const trimmed =
          prev.length >= maxCount
            ? prev.slice(prev.length - maxCount + 1)
            : prev;
        return [...trimmed, newItem];
      });

      return id;
    },
    [maxCount, defaultTimeout, defaultVariant]
  );

  return {
    snackbars,
    triggerSnackbar,
    removeSnackbar,
    clearAll,
  };
}
