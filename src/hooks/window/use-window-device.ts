'use client';

import { useMemo, useSyncExternalStore } from 'react';

const BreakPoints = {
  'width-sm': 640,
  'width-md': 768,
  'width-lg': 1024,
  'width-xl': 1280,
  'width-2xl': 1536,
};

export default function useWindowDevice() {
  const width = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isReady = useMemo(() => {
    return width !== undefined;
  }, [width]);

  const isDesktop = useMemo(() => {
    if (width === undefined) return false;
    return width >= BreakPoints['width-lg'];
  }, [width]);

  const isPad = useMemo(() => {
    if (width === undefined) return false;
    return width < BreakPoints['width-lg'] && width >= BreakPoints['width-sm'];
  }, [width]);

  const isMobile = useMemo(() => {
    if (width === undefined) return false;
    return width < BreakPoints['width-sm'];
  }, [width]);

  const isNotDesktop = useMemo(() => {
    if (width === undefined) return false;
    return !isDesktop;
  }, [width, isDesktop]);

  return {
    isReady,
    isDesktop,
    isNotDesktop,
    isPad,
    isMobile,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('resize', callback);

  return () => {
    window.removeEventListener('resize', callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') return undefined;

  return window.innerWidth;
}

function getServerSnapshot() {
  return undefined;
}
