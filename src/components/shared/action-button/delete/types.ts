import type { ActionButtonProps } from '@/types/common/action-button';
import type { MouseEventHandler } from 'react';

export interface DeleteActionProps extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Toast message shown after deletion/clear.
   * - string: displays custom message (e.g. 'Input cleared')
   * - true: displays default 'Cleared'
   * - undefined / false: no toast is shown
   */
  successToast?: string | boolean;
}
