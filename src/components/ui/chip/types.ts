import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

export type ChipProps = {
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  size?: ChipSize;
  icon?: LucideIcon;
  showCheck?: boolean;
  className?: string;
};
