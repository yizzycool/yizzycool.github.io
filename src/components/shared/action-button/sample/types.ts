import type { ActionButtonProps } from '@/types/common/action-button';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';

export interface SampleActionProps extends ActionButtonProps {
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Toast message shown after loading sample data.
   * - string: displays custom message (e.g. 'Sample data loaded')
   * - true: displays default 'Sample data loaded'
   * - undefined / false: no toast is shown
   */
  successToast?: string | boolean;
}
