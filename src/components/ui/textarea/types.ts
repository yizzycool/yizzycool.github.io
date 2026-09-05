import type { ChangeEvent, Ref } from 'react';

export type TextareaProps = {
  title?: string;
  desc?: string;
  id?: string;
  value?: string;
  readOnly?: boolean;
  rows?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  ref?: Ref<HTMLElement>;
};
