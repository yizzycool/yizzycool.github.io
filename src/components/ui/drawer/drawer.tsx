'use client';

import type { DrawerProps } from './types';

import { useEffect } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/utils/cn';
import { Presence } from '@/components/ui/presence';
import { Portal } from '@/components/ui/portal';

import { drawerMotionVariants, drawerPositions } from './drawer.variants';

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  className = '',
  drawerClassName = '',
  backdropClassName = '',
  backdrop = true,
  portal = true,
  portalContainer,
  unmount = true,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
            'inset-0 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12',
            isOpen ? 'pointer-events-auto' : 'pointer-events-none',
            className
          )}
        >
          {backdrop && (
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn(
                'absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40',
                isOpen ? 'pointer-events-auto' : 'pointer-events-none',
                backdropClassName
              )}
              onClick={onClose}
            />
          )}
          <motion.div
            key="drawer-panel"
            initial={drawerMotionVariants[side].closed}
            animate={
              isOpen
                ? drawerMotionVariants[side].open
                : drawerMotionVariants[side].closed
            }
            exit={drawerMotionVariants[side].closed}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'absolute flex flex-col overflow-hidden shadow-2xl',
              'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95',
              drawerPositions[side],
              isOpen ? 'pointer-events-auto' : 'pointer-events-none',
              drawerClassName
            )}
          >
            {children}
          </motion.div>
        </div>
      </Portal>
    </Presence>
  );
}
