export type ScrollToTopProps = {
  /** Distance from top in pixels before the button appears. @default 1000 */
  threshold?: number;
  /** Whether to scroll smoothly or instantly. @default true */
  smooth?: boolean;
  /** Extra CSS classes for container. */
  className?: string;
  /** Extra CSS classes for the icon. */
  iconClassName?: string;
};
