'use client';

import { useState } from 'react';

export function useControlDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    openDrawer: open,
    closeDrawer: close,
    toggleDrawer: toggle,
  };
}
