import type { ReactNode } from 'react';

export type PortalProps = {
  /**
   * Target container to mount children into.
   * Accepts a CSS selector string or HTMLElement node.
   * Defaults to document.body.
   */
  container?: string | HTMLElement | null;

  /**
   * When true, disables teleportation and renders children inline in the current DOM hierarchy.
   * Defaults to false.
   */
  disabled?: boolean;

  children: ReactNode;
};
