'use client';

import type { Rounded } from '@/types/common';

import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';

type Side = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  side?: Side;
  rounded?: Rounded;
  wrapperClassName?: string;
  backdrop?: boolean;
  className?: string;
  usePortal?: boolean;
  children?: React.ReactNode;
};

const RoundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const sideRoundedMap: Record<Side, (r: string) => string> = {
  top: (r) => r.replace('rounded', 'rounded-b'),
  bottom: (r) => r.replace('rounded', 'rounded-t'),
  left: (r) => r.replace('rounded', 'rounded-r'),
  right: (r) => r.replace('rounded', 'rounded-l'),
};

const motionVariants = {
  top: {
    open: { y: 0 },
    closed: { y: '-100%' },
  },
  bottom: {
    open: { y: 0 },
    closed: { y: '100%' },
  },
  left: {
    open: { x: 0 },
    closed: { x: '-100%' },
  },
  right: {
    open: { x: 0 },
    closed: { x: '100%' },
  },
};

const positions = {
  top: 'top-0 left-0 w-full max-h-[90%]',
  bottom: 'bottom-0 left-0 w-full max-h-[90%]',
  left: 'top-0 left-0 h-full max-w-[90%]',
  right: 'top-0 right-0 h-full max-w-[90%]',
};

export default function Drawer({
  isOpen,
  onClose,
  side = 'right',
  rounded = 'none',
  wrapperClassName = '',
  backdrop = true,
  className = '',
  usePortal = true,
  children,
}: Props) {
  return (
    <Wrapper
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
          isOpen ? motionVariants[side].open : motionVariants[side].closed
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={cn(
          'absolute flex flex-col overflow-hidden shadow-2xl',
          'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95',
          positions[side],
          sideRoundedMap[side](RoundedMap[rounded]),
          isOpen ? 'pointer-events-auto' : 'pointer-events-none',
          className
        )}
      >
        {children}
      </motion.div>
    </Wrapper>
  );
}

function Wrapper({
  isOpen,
  usePortal,
  children,
  onClose,
  ...rests
}: {
  isOpen: boolean;
  usePortal: boolean;
  children: React.ReactNode;
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
