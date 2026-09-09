import type { Animation, Rounded } from '@/types/common';
import type { SurfaceVariant } from '@/types/common/surface';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  variant?: SurfaceVariant;
  rounded?: Rounded;
  hoverEffect?: boolean;
  bordered?: boolean;
  animation?: Animation;
  children?: ReactNode;
  className?: string;
}
