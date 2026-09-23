export type CheckboxTheme = 'base' | 'card' | 'list';
export type CheckboxIconStyle = 'tick' | 'circle' | 'rounded';

/**
 * Props for the Checkbox group component.
 */
export type CheckboxProps<T extends readonly string[]> = {
  /** Array of checkbox option label keys */
  options: T;
  /** Optional descriptions mapped per option key */
  optionsDesc?: { [K in keyof T]: string };
  /** Default checked state map */
  defaultChecked?: { [K in keyof T]: boolean };
  /** Visual presentation theme (default: 'base') */
  theme?: CheckboxTheme;
  /** Check indicator icon style (default: 'tick') */
  iconStyle?: CheckboxIconStyle;
  /** Additional CSS class names for the outer wrapper */
  wrapperClassName?: string;
  /** Additional CSS class names for option labels */
  labelClassName?: string;
  /** Change callback fired when an option's checked state toggles */
  onChange: (option: T[number], value: boolean) => void;
};
