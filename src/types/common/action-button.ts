import type { Rounded } from '.';
import type { ButtonSize, ButtonVariant } from './button';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ActionButtonDisplays = ['icon', 'icon-label', 'label'] as const;

export type ActionButtonDisplay = (typeof ActionButtonDisplays)[number];

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
