'use client';

import type { BaseDialogProps } from './types';

import { useEffect } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/utils/cn';
import { Presence } from '@/components/ui/presence';
import { Portal } from '@/components/ui/portal';

import {
  baseDialogBackdropStyles,
  baseDialogPanelStyles,
  baseDialogWrapperStyles,
  dialogMotionVariants,
} from './base-dialog.variants';

export function BaseDialog({
  isOpen,
  onClose,
  className = '',
  dialogClassName = '',
  backdropClassName = '',
  backdrop = true,
  portal = true,
  portalContainer,
  unmount = true,
  children,
}: BaseDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Presence isOpen={isOpen} unmount={unmount}>
      <Portal disabled={!portal} container={portalContainer}>
        <div
          role="dialog"
          tabIndex={-1}
          aria-modal={isOpen || undefined}
          aria-hidden={!isOpen}
          className={cn(
            portal ? 'fixed z-50' : 'absolute z-10',
            baseDialogWrapperStyles,
            isOpen && backdrop ? 'pointer-events-auto' : 'pointer-events-none',
            className
          )}
        >
          {backdrop && (
            <motion.div
              key="dialog-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(
                baseDialogBackdropStyles,
                isOpen ? 'pointer-events-auto' : 'pointer-events-none',
                backdropClassName
              )}
              onClick={onClose}
            />
          )}
          <motion.div
            key="dialog-panel"
            initial={dialogMotionVariants.closed}
            animate={
              isOpen ? dialogMotionVariants.open : dialogMotionVariants.closed
            }
            exit={dialogMotionVariants.closed}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              baseDialogPanelStyles,
              isOpen ? 'pointer-events-auto' : 'pointer-events-none',
              dialogClassName
            )}
          >
            {children}
          </motion.div>
        </div>
      </Portal>
    </Presence>
  );
}
