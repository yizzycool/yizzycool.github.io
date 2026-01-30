'use client';

import { useCallback } from 'react';

export default function usePreventNumberWheel() {
  const onWheel = useCallback((e: WheelEvent) => {
    const target = e.currentTarget as HTMLInputElement;
    if (document.activeElement !== target) return;
    e.preventDefault();
    target.blur();
  }, []);

  const refCallback = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) return;

      node.addEventListener('wheel', onWheel, { passive: false });

      return () => {
        node.removeEventListener('wheel', onWheel);
      };
    },
    [onWheel]
  );

  return refCallback;
}
