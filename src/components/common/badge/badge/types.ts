import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Rounded } from '@/types/common';
import type { BadgeSize, BadgeVariant } from '@/types/common/badge';

export type BadgeProps = {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
};
