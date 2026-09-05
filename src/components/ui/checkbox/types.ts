export type CheckboxTheme = 'base' | 'card' | 'list';
export type CheckboxIconStyle = 'tick' | 'circle' | 'rounded';

export type CheckboxProps<T extends readonly string[]> = {
  options: T;
  optionsDesc?: { [K in keyof T]: string };
  defaultChecked?: { [K in keyof T]: boolean };
  theme?: CheckboxTheme;
  iconStyle?: CheckboxIconStyle;
  wrapperClassName?: string;
  labelClassName?: string;
  onChange: (option: T[number], value: boolean) => void;
};
