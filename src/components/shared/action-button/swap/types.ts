import type { ActionButtonProps } from '@/types/common/action-button';
import type { MouseEventHandler } from 'react';

export interface SwapActionProps extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Toast message shown after swap.
   * - string: displays custom message (e.g. 'Direction swapped')
   * - true: displays default 'Swapped'
   * - undefined / false: no toast is shown
   */
  successToast?: string | boolean;
}
