'use client';

import type { ClientPortalProps } from './types';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

function emptySubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

export function ClientPortal({
  selectorOrElement,
  portalKey,
  children,
}: ClientPortalProps) {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return null;

    if (!selectorOrElement) {
      return document.body;
    }

    if (typeof selectorOrElement === 'string') {
      return document.querySelector<HTMLElement>(selectorOrElement);
    }

    if (selectorOrElement instanceof HTMLElement) {
      return selectorOrElement;
    }

    return null;
  };

  const container = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!container) return null;

  return createPortal(children, container, portalKey);
}
