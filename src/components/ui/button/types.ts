import type { Rounded } from '@/types/common';
import type { ButtonSize, ButtonVariant } from '@/types/common/button';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode, Ref } from 'react';

export type { ButtonVariant, ButtonSize } from '@/types/common/button';

export type ButtonProps = {
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
  disabled?: boolean;
  hoverEffect?: boolean;
  ariaLabel?: string;
  id?: string;
  title?: string;
};
