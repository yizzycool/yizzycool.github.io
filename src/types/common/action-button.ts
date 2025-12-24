import type { Rounded } from '.';
import type { ButtonSize, ButtonVariant } from './button';

export type ActionButtonDisplay = 'icon' | 'icon-label' | 'label';

export interface ActionButtonProps {
  display?: ActionButtonDisplay;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: Rounded;
  bordered?: boolean;
  className?: string;
  disabled?: boolean;
  label?: string;
}
