'use client';

import type { PortalProps } from './types';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

function emptySubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

export function Portal({
  container: targetContainer,
  disabled = false,
  children,
}: PortalProps) {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return null;

    if (!targetContainer) {
      return document.body;
    }

    if (typeof targetContainer === 'string') {
      return document.querySelector<HTMLElement>(targetContainer);
    }

    if (targetContainer instanceof HTMLElement) {
      return targetContainer;
    }

    return null;
  };

  const containerNode = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (disabled) {
    return <>{children}</>;
  }

  if (!containerNode) return null;

  return createPortal(children, containerNode);
}
