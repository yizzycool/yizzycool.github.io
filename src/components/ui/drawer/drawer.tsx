'use client';

import type { ReactNode } from 'react';
import type { DrawerProps } from './types';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';
import {
  drawerMotionVariants,
  drawerPositions,
  drawerRoundedMap,
  drawerSideRoundedMap,
} from './drawer.variants';

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  rounded = 'none',
  wrapperClassName = '',
  backdrop = true,
  className = '',
  usePortal = true,
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
    <DrawerWrapper
      isOpen={isOpen}
      usePortal={usePortal}
      className={cn(
        usePortal ? 'fixed z-50' : 'absolute z-10',
        'inset-0 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
        wrapperClassName
      )}
      onClose={onClose}
    >
      {backdrop && (
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40',
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          onClick={onClose}
        />
      )}
      {/* Rounded Border */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? drawerMotionVariants[side].open
            : drawerMotionVariants[side].closed
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={cn(
          'absolute flex flex-col overflow-hidden shadow-2xl',
          'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95',
          drawerPositions[side],
          drawerSideRoundedMap[side](drawerRoundedMap[rounded]),
          isOpen ? 'pointer-events-auto' : 'pointer-events-none',
          className
        )}
      >
        {children}
      </motion.div>
    </DrawerWrapper>
  );
}

function DrawerWrapper({
  isOpen,
  usePortal,
  children,
  ...rests
}: {
  isOpen: boolean;
  usePortal: boolean;
  children: ReactNode;
  className?: string;
  onClose: (value: boolean) => void;
}) {
  const isClient = useIsClient();

  if (usePortal) {
    if (!isClient) return null;
    return createPortal(
      <div
        {...rests}
        role="dialog"
        tabIndex={-1}
        aria-modal={isOpen || undefined}
        aria-hidden={!isOpen}
      >
        {children}
      </div>,
      document.body
    );
  }
  return (
    <div
      {...rests}
      role="dialog"
      tabIndex={-1}
      aria-modal={isOpen || undefined}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}
