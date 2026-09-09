'use client';

import type { PresenceProps } from './types';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';

export function Presence({
  isOpen,
  unmount = true,
  mode = 'sync',
  initial = false,
  onExitComplete,
  children,
}: PresenceProps) {
  const [isMounted, setIsMounted] = useState(isOpen);

  if (!unmount) {
    return <>{children}</>;
  }

  const unmountChildren = unmount && !isMounted && !isOpen;

  return (
    <AnimatePresence
      mode={mode}
      initial={initial}
      onExitComplete={() => {
        setIsMounted(false);
        onExitComplete?.();
      }}
    >
      {!unmountChildren && children}
    </AnimatePresence>
  );
}
