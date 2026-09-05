import type { ReactNode } from 'react';

export type ClientPortalProps = {
  selectorOrElement?: string | HTMLElement;
  portalKey?: string;
  children: ReactNode;
};
