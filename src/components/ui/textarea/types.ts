import type { ChangeEvent, Ref } from 'react';

/**
 * Props for the multiline Textarea component.
 */
export type TextareaProps = {
  /** Optional form field title */
  title?: string;
  /** Optional helper description */
  desc?: string;
  /** HTML id attribute */
  id?: string;
  /** Controlled textarea value */
  value?: string;
  /** Whether the textarea is read-only */
  readOnly?: boolean;
  /** Number of visible text lines */
  rows?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Text change event handler */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Optional React ref */
  ref?: Ref<HTMLElement>;
};
