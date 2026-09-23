import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Props for the DialogHeader component.
 */
export type DialogHeaderProps = {
  /** Title text or custom React node */
  title?: ReactNode;
  /** Subtitle / description text or custom React node */
  description?: ReactNode;
  /** Lucide icon component rendered inside the icon container */
  icon?: LucideIcon;
  /** Size of the icon in pixels (default: 18) */
  iconSize?: number;
  /** Custom CSS classes applied to the icon element */
  iconClassName?: string;
  /** Custom CSS classes for the rounded icon container */
  iconContainerClassName?: string;
  /** Close callback; when provided, automatically renders a ghost close button with X icon */
  onClose?: () => void;
  /** Accessible label for the close button (default: 'Close dialog') */
  closeAriaLabel?: string;
  /** Whether to render the bottom border (default: true) */
  bordered?: boolean;
  /** Custom CSS classes for the outer header container */
  className?: string;
  /** Additional custom action elements rendered before the close button */
  actions?: ReactNode;
  /** Optional custom child nodes */
  children?: ReactNode;
};
