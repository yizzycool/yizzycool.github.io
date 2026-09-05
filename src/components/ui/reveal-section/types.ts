import type { ReactNode } from 'react';

export type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
};
