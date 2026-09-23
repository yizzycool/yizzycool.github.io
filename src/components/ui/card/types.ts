import type { Animation, Rounded } from '@/types/common';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode, Ref } from 'react';

/**
 * Props for the surface Card component.
 */
export type CardProps = {
  /** Optional React ref forwarded to card container */
  ref?: Ref<HTMLDivElement>;
  /** HTML id attribute */
  id?: string;
  /** Additional CSS class names */
  className?: string;
  /** Border radius scale (default: 'lg') */
  rounded?: Rounded;
  /** Animation preset to apply */
  animation?: Animation;
  /** Card body content */
  children?: ReactNode;
  /** Click event handler */
  onClick?: MouseEventHandler<HTMLDivElement>;
};

/**
 * Props for CardTitle subcomponent.
 */
export type CardTitleProps = {
  /** Optional Lucide icon displayed next to the title */
  icon?: LucideIcon;
  /** Title text or custom node */
  children?: ReactNode;
  /** Additional CSS class names */
  className?: string;
};
