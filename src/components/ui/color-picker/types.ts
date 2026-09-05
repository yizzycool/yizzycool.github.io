import type { ChangeEvent } from 'react';

export type ColorPickerVariant = 'card' | 'input';

export type ColorPickerProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  variant?: ColorPickerVariant;
  label?: string;
  showHex?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
};
