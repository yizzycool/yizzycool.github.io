import type { ActionButtonProps } from '@/types/common/action-button';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

export interface ConfigDialogProps extends ActionButtonProps {
  title?: string;
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}
