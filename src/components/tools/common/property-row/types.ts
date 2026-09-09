import type { SurfaceVariant } from '@/components/ui/surface';
import type { ReactNode } from 'react';

export type PropertyItem = {
  id?: string;
  label: string;
  value?: string | number | null;
  badge?: string;
  variant?: SurfaceVariant;
  copyable?: boolean;
  action?: ReactNode;
  mono?: boolean;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
};

export type PropertyRowProps = PropertyItem & {
  className?: string;
};

export type PropertyColumns =
  | 1
  | 2
  | 3
  | 4
  | {
      sm?: 1 | 2 | 3 | 4;
      md?: 1 | 2 | 3 | 4;
      lg?: 1 | 2 | 3 | 4;
    };

export type PropertyListProps = {
  items?: PropertyItem[];
  children?: ReactNode;
  columns?: PropertyColumns;
  variant?: SurfaceVariant;
  copyable?: boolean;
  mono?: boolean;
  gap?: 'sm' | 'base' | 'lg';
  className?: string;
};
