import type { ActionButtonProps } from '@/types/common/action-button';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

/**
 * Props for the ConfigDialog modal trigger button and dialog panel.
 */
export interface ConfigDialogProps extends ActionButtonProps {
  /** Title header text for the dialog */
  title?: string;
  /** Optional icon displayed in the trigger button and dialog header */
  icon?: LucideIcon;
  /** Optional custom click event handler */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Dialog content body nodes */
  children?: ReactNode;
}
