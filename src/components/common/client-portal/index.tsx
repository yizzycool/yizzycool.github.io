'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps {
  selectorOrElement?: string | HTMLElement;
  portalKey?: string;
  children: ReactNode;
}

const emptySubscribe = () => () => {};
const getServerSnapshot = () => null;

export default function ClientPortal({
  selectorOrElement,
  portalKey,
  children,
}: ClientPortalProps) {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return null;

    // Default -> document.body
    if (!selectorOrElement) {
      return document.body;
    }

    // String -> selector
    if (typeof selectorOrElement === 'string') {
      return document.querySelector<HTMLElement>(selectorOrElement);
    }

    // HTML Element -> element
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
