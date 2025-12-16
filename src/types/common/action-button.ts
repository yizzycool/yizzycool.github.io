import type { ButtonSize, ButtonVariant } from './button';

export type ActionButtonDisplay = 'icon' | 'icon-label' | 'label';

export interface ActionButtonProps {
  display?: ActionButtonDisplay;
  size?: ButtonSize;
  disabled?: boolean;
  variant?: ButtonVariant;
}
