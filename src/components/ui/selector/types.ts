import { RefObject } from 'react';

export type SelectorSize = 'xs' | 'sm' | 'base' | 'lg';

export type SelectorOptionItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectorOption = string | SelectorOptionItem;

export type SelectorProps = {
  title?: string;
  desc?: string;
  defaultValue?: string;
  value?: string;
  options: Array<SelectorOption>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: SelectorSize;
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
