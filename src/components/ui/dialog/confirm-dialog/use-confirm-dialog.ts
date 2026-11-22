'use client';

import type { ReactNode } from 'react';
import type { ConfirmDialogProps, ConfirmDialogVariant } from './types';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ConfirmDialogOptions {
  /** Dialog heading title text */
  title: string;
  /** Detailed confirmation message or custom node */
  message: ReactNode;
  /** Label for the confirm button (default: 'Confirm') */
  confirmText?: string;
  /** Label for the cancel button (default: 'Cancel') */
  cancelText?: string;
  /** Visual variant for the confirm button (default: 'error') */
  confirmVariant?: ConfirmDialogVariant;
  /** Additional CSS classes for the dialog */
  className?: string;
  /** Optional callback executed when user confirms */
  onConfirm?: () => void;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmDialogVariant;
  className?: string;
}

const INITIAL_STATE: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
};

/**
 * Stateful imperative trigger hook paired with `<ConfirmDialog {...dialogProps} />`.
 * Eliminates boilerplate open booleans and multiple dialog instances per component,
 * supporting both `onConfirm` callbacks and `await confirm(...)` flows.
 */
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(INITIAL_STATE);

  const onConfirmRef = useRef<(() => void) | undefined>(undefined);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const settlePendingPromise = useCallback((confirmed: boolean) => {
    if (resolverRef.current) {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      resolve(confirmed);
    }
  }, []);

  const close = useCallback(() => {
    // Keep title/message intact while closing so AnimatePresence exit fades smoothly
    setState((prev) => ({ ...prev, isOpen: false }));
    onConfirmRef.current = undefined;
    settlePendingPromise(false);
  }, [settlePendingPromise]);

  const handleConfirm = useCallback(() => {
    settlePendingPromise(true);
    const callback = onConfirmRef.current;
    onConfirmRef.current = undefined;
    callback?.();
  }, [settlePendingPromise]);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      settlePendingPromise(false);
      onConfirmRef.current = options.onConfirm;

      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        confirmVariant: options.confirmVariant,
        className: options.className,
      });

      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [settlePendingPromise]
  );

  useEffect(() => {
    return () => {
      settlePendingPromise(false);
    };
  }, [settlePendingPromise]);

  const dialogProps: ConfirmDialogProps = {
    isOpen: state.isOpen,
    onClose: close,
    onConfirm: handleConfirm,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    confirmVariant: state.confirmVariant,
    className: state.className,
  };

  return {
    isOpen: state.isOpen,
    confirm,
    close,
    dialogProps,
  };
}
