import type { LucideIcon } from 'lucide-react';
import type {
  ChangeEvent,
  FocusEvent,
  HTMLAttributes,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  Ref,
} from 'react';

/**
 * Props for the text Input component.
 */
export type InputProps = {
  /** Optional React ref for the input element */
  ref?: Ref<HTMLElement>;
  /** Optional field title text displayed above the input */
  title?: string;
  /** Optional helper description text */
  desc?: string;
  /** HTML id attribute */
  id?: string;
  /** HTML input type (e.g. 'text', 'password', 'number', default: 'text') */
  type?: HTMLInputTypeAttribute;
  /** Virtual keyboard mode hint (e.g. 'numeric', 'email') */
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  /** Input value for controlled usage */
  value?: string | number;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input should automatically focus on mount */
  autoFocus?: boolean;
  /** Additional CSS class names for the input element */
  className?: string;
  /** Optional leading Lucide icon */
  icon?: LucideIcon;
  /** Additional CSS class names for the icon */
  iconClassName?: string;
  /** Callback to clear input text; renders clear button when provided and input has value */
  onClear?: () => void;
  /** Input change event handler */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Key down event handler */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Blur event handler */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
};
