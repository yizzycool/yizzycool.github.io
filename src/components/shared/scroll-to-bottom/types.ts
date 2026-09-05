import type { RefObject } from 'react';

export type ScrollToBottomProps = {
  /** Distance from bottom in pixels before the button appears. @default 200 */
  threshold?: number;
  /** Whether to scroll smoothly or instantly. @default true */
  smooth?: boolean;
  /** Target container element ref. If not provided, scrolls window. */
  targetRef?: RefObject<HTMLElement | null>;
  /** Extra CSS classes for container. */
  className?: string;
  /** Extra CSS classes for the icon. */
  iconClassName?: string;
  /** Callback when scroll to bottom button is clicked. */
  onClick?: () => void;
};
