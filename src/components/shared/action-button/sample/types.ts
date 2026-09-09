import type { ActionButtonProps } from '@/types/common/action-button';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';

export interface SampleActionProps extends ActionButtonProps {
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
