'use client';

import type { DrawerProps } from './types';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/utils/cn';

import { drawerMotionVariants, drawerPositions } from './drawer.variants';

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  className = '',
  drawerClassName = '',
  backdropClassName = '',
  backdrop = true,
  children,
}: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="drawer-presence"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                  'fixed inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40',
                  backdropClassName
                )}
              />
            )}

            <MotionPanel
              initial={drawerMotionVariants[side].closed}
              animate={drawerMotionVariants[side].open}
              exit={drawerMotionVariants[side].closed}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn(
                'fixed z-50 flex flex-col overflow-hidden shadow-2xl',
                'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95',
                drawerPositions[side],
                drawerClassName
              )}
            >
              {children}
            </MotionPanel>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
