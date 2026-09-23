import { RefObject } from 'react';

export type SelectorSize = 'xs' | 'sm' | 'base' | 'lg';

/**
 * Option item configuration for Selector.
 */
export type SelectorOptionItem = {
  /** Display label for the option */
  label: string;
  /** Value string associated with the option */
  value: string;
  /** Whether the option is disabled */
  disabled?: boolean;
};

export type SelectorOption = string | SelectorOptionItem;

/**
 * Props for the Selector (combobox dropdown) component.
 */
export type SelectorProps = {
  /** Optional form field title */
  title?: string;
  /** Optional description text displayed below the title */
  desc?: string;
  /** Initial selected value for uncontrolled usage */
  defaultValue?: string;
  /** Controlled selected value */
  value?: string;
  /** Array of string values or structured options */
  options: Array<SelectorOption>;
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
  /** Disables the entire selector */
  disabled?: boolean;
  /** Additional CSS class names for the trigger */
  className?: string;
  /** Size scale of the selector (default: 'base') */
  size?: SelectorSize;
  /** Change callback fired when an option is picked */
  onChange: (value: string) => void;
};

export type OptionTypes = {
  elementsRef: RefObject<Array<HTMLElement | null>>;
  option: SelectorOptionItem;
  currentValue: string;
  index: number;
  activeIndex: number | null;
  size?: SelectorSize;
  getItemProps: (
    userProps?: Omit<React.HTMLProps<HTMLElement>, 'selected' | 'active'> & {
      active?: boolean | undefined;
      selected?: boolean | undefined;
    }
  ) => Record<string, unknown>;
  handleSelect: (val: string) => void;
};
