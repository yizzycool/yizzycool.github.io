import type { Animation, Rounded } from '@/types/common';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode, Ref } from 'react';

export type CardProps = {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  className?: string;
  rounded?: Rounded;
  animation?: Animation;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export type CardTitleProps = {
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
};
