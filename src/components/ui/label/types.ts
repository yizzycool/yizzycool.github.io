import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type LabelProps = {
  htmlFor?: string;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
};
