'use client';

import type { ErrorMessageProps } from './types';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/utils/cn';
import {
  errorMessageBaseStyles,
  errorMotionVariants,
} from './error-message.variants';
import { DEFAULT_ERROR_MOTION_TRANSITION } from './constants';

export function ErrorMessage({
  message,
  className = '',
  id,
}: ErrorMessageProps) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key="error-wrapper"
          initial={errorMotionVariants.initial}
          animate={errorMotionVariants.animate}
          exit={errorMotionVariants.exit}
          transition={DEFAULT_ERROR_MOTION_TRANSITION}
          className="overflow-hidden"
        >
          <div
            id={id}
            role="alert"
            aria-live="polite"
            className={cn(errorMessageBaseStyles, 'pt-1.5', className)}
          >
            {message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
