'use client';

import type { ReactNode } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/utils/cn';

type Props = {
  isOpen?: boolean;
  children: ReactNode;
  className?: string;
  cardClassName?: string;
};

export default function StatusCardOverlay({
  isOpen = true,
  children,
  className = '',
  cardClassName = '',
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4',
            'bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.035)_0,rgba(0,0,0,0.035)_1px,transparent_0,transparent_16px),repeating-linear-gradient(135deg,rgba(0,0,0,0.035)_0,rgba(0,0,0,0.035)_1px,transparent_0,transparent_16px)]',
            'dark:bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_0,transparent_16px),repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_0,transparent_16px)]',
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto relative flex max-h-full w-full max-w-md flex-col overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl dark:border-neutral-700 dark:bg-[#111]',
              cardClassName
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
