import type { LucideIcon } from 'lucide-react';
import type {
  ChangeEvent,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  Ref,
} from 'react';

export type InputProps = {
  ref?: Ref<HTMLElement>;
  title?: string;
  desc?: string;
  id?: string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  onClear?: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};
