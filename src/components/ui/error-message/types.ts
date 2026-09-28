import type { ReactNode } from 'react';

export type ErrorMessageProps = {
  /** The error message string or node to display. When falsy, it animates out. */
  message?: ReactNode;
  /** Custom CSS classes for the inner text container */
  className?: string;
  /** Optional element ID for aria-describedby accessibility linking */
  id?: string;
};
