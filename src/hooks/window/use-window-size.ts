'use client';

import { useSyncExternalStore } from 'react';

export interface WindowSize {
  innerWidth: number | undefined;
  innerHeight: number | undefined;
  width: number | undefined;
  height: number | undefined;
}
/**
 * Hook to track window innerWidth and innerHeight using `useSyncExternalStore`.
 * Automatically updates when the window is resized.
 *
 * @returns {WindowSize} Object containing innerWidth, innerHeight, and width, height aliases.
 */
export default function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

let currentSnapshot: WindowSize = {
  innerWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
  innerHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
  width: typeof window !== 'undefined' ? window.innerWidth : undefined,
  height: typeof window !== 'undefined' ? window.innerHeight : undefined,
};

function getSnapshot(): WindowSize {
  if (typeof window !== 'undefined') {
    if (
      currentSnapshot.innerWidth !== window.innerWidth ||
      currentSnapshot.innerHeight !== window.innerHeight
    ) {
      currentSnapshot = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  }
  return currentSnapshot;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
}

const serverSnapshot: WindowSize = {
  innerWidth: undefined,
  innerHeight: undefined,
  width: undefined,
  height: undefined,
};

function getServerSnapshot(): WindowSize {
  return serverSnapshot;
}
