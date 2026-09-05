import type { ActionButtonProps } from '@/types/common/action-button';
import type { MouseEventHandler } from 'react';

export interface SwapActionProps extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
