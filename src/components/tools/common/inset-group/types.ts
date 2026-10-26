import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface InsetGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** Child elements, typically grouped PropertyRow or InsetGroupRow */
  children: ReactNode;
  /** Border radius curvature, defaults to 'xl' (also supports '2xl') */
  rounded?: 'xl' | '2xl';
}

export interface InsetGroupRowProps extends ComponentPropsWithoutRef<'div'> {
  /** Row content */
  children: ReactNode;
  /** Whether to enable hover background transition effect, defaults to true */
  hoverable?: boolean;
}
