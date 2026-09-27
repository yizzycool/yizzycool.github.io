import type { ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ColorPickerVariant =
  | 'card'
  | 'input'
  | 'swatch'
  | 'circle'
  | 'solid';

/**
 * Props for the ColorPicker component.
 */
export type ColorPickerProps = {
  /** Current hex color value (e.g. '#3b82f6') */
  value?: string;
  /** Change callback fired with native ChangeEvent */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Direct color string callback for convenience */
  onColorChange?: (color: string) => void;
  /** Visual variant: 'card' (full card), 'input' (color block), 'swatch' / 'circle' (round rainbow button), or 'solid' (swatch displaying current color) */
  variant?: ColorPickerVariant;
  /** Optional display label (used in 'card' variant) */
  label?: string;
  /** Whether to show the hex string value (used in 'card' variant) */
  showHex?: boolean;
  /** Title or tooltip text */
  title?: string;
  /** Whether to display the HTML title attribute (tooltip) on hover/touch. Default is true */
  showTitle?: boolean;
  /** HTML id attribute */
  id?: string;
  /** Additional CSS class names for outer container */
  className?: string;
  /** Additional CSS class names for the color input element */
  inputClassName?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Disables color picking */
  disabled?: boolean;
  /** Optional Lucide icon for swatch / circle variant (default: Pipette) */
  icon?: LucideIcon;
  /** Custom CSS classes for the swatch icon */
  iconClassName?: string;
  /** Custom CSS classes for the swatch button */
  buttonClassName?: string;
};
