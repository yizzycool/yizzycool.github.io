import type { ActionButtonProps } from '@/types/common/action-button';
import type { MouseEventHandler } from 'react';

export interface DeleteActionProps extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
