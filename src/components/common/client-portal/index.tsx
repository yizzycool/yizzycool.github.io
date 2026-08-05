'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps {
  selectorOrElement?: string | HTMLElement;
  portalKey?: string;
  children: ReactNode;
}

export default function ClientPortal({
  selectorOrElement,
  portalKey,
  children,
}: ClientPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Default -> document.body
    if (!selectorOrElement) {
      setContainer(document.body);
      return;
    }

    // String -> selector
    if (typeof selectorOrElement === 'string') {
      setContainer(document.querySelector<HTMLElement>(selectorOrElement));
      return;
    }

    // HTML Element -> element
    if (selectorOrElement instanceof HTMLElement) {
      setContainer(selectorOrElement);
    }
  }, [selectorOrElement]);

  if (!container) return null;

  return createPortal(children, container, portalKey);
}
