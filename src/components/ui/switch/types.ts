import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type SwitchSize = 'xs' | 'sm' | 'base' | 'lg';

export type SwitchLabelPosition = 'left' | 'right';

export type SwitchProps = {
  /** Whether the switch is toggled on */
  checked: boolean;
  /** Callback function triggered when the state changes */
  onChange: (checked: boolean) => void;
  /** Optional text or custom node label displayed next to the switch */
  label?: ReactNode;
  /** Optional icon to display alongside the label */
  icon?: LucideIcon;
  /** Custom class for the icon */
  iconClassName?: string;
  /** Whether the icon changes color when checked (default: false) */
  highlightIconOnChecked?: boolean;
  /** Size of the switch (default: 'sm') */
  size?: SwitchSize;
  /** Position of the label relative to the switch toggle (default: 'left') */
  labelPosition?: SwitchLabelPosition;
  /** Whether the switch is interactive */
  disabled?: boolean;
  /** Additional CSS classes for the label wrapper container */
  className?: string;
  /** Additional CSS classes for the label text */
  labelClassName?: string;
  /** Unique ID for the input element (for accessibility) */
  id?: string;
};

export type SwitchLabelProps = {
  label?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  highlightIconOnChecked?: boolean;
  textSize: string;
  iconSize: number;
  checked: boolean;
  disabled?: boolean;
  className?: string;
};
