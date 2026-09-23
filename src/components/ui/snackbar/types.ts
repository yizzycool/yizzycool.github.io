import type { Rounded } from '@/types/common';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type SnackbarVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'ghost-sky'
  | 'outline'
  | 'error'
  | 'dark-sky'
  | 'neutral'
  | 'success'
  | 'blue'
  | 'amber'
  | 'surface';

export type SnackbarVariants = SnackbarVariant;

export type SnackbarSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

export type SnackbarSizes = SnackbarSize;

export type SnackbarPosition =
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export type SnackbarItem = {
  id: string;
  content: ReactNode;
  variant?: SnackbarVariant;
  timeout?: number;
  icon?: LucideIcon;
  showCloseIcon?: boolean;
};

export type SnackbarProps = {
  /** Multi-toast queue */
  snackbars: SnackbarItem[];
  /** Callback to close a snackbar by id */
  onClose: (id: string) => void;
  /** Toast container screen position (default: 'top right') */
  position?: SnackbarPosition;
  /** Toast padding and text size (default: 'base') */
  size?: SnackbarSize;
  /** Rounded corner style (default: 'base') */
  rounded?: Rounded;
  /** Whether to render border (default: true) */
  bordered?: boolean;
  /** Additional container css class */
  className?: string;
  /** Screen horizontal offset in pixels (default: 20) */
  offsetX?: number;
  /** Screen vertical offset in pixels (default: 20) */
  offsetY?: number;
};
