'use client';

import type { BaseDialogProps } from './types';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/utils/cn';

import {
  baseDialogBackdropStyles,
  baseDialogPanelStyles,
  baseDialogWrapperStyles,
  dialogMotionVariants,
} from './base-dialog.variants';

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

export function BaseDialog({
  isOpen,
  onClose = () => {},
  className = '',
  dialogClassName = '',
  backdropClassName = '',
  backdrop = true,
  children,
}: BaseDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={onClose}
          className={cn('relative z-50', className)}
        >
          {backdrop && (
            <MotionBackdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(baseDialogBackdropStyles, backdropClassName)}
            />
          )}

          <div className={cn('fixed', baseDialogWrapperStyles)}>
            <MotionPanel
              initial={dialogMotionVariants.closed}
              animate={dialogMotionVariants.open}
              exit={dialogMotionVariants.closed}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(baseDialogPanelStyles, dialogClassName)}
            >
              {children}
            </MotionPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
