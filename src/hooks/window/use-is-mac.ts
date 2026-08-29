'use client';

import { useSyncExternalStore } from 'react';

export default function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  // User-Agent Client Hints (Chromium Browser)
  // @ts-expect-error userAgentData Not yet being built-in in all TypeScript libraries
  const platform = navigator.userAgentData?.platform;
  if (typeof platform === 'string') {
    return /mac/i.test(platform);
  }

  // fallback - userAgent
  return /Macintosh|Mac OS X/i.test(navigator.userAgent);
}

function getServerSnapshot() {
  return undefined;
}
