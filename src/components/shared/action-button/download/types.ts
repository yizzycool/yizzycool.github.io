import type { ActionButtonProps } from '@/types/common/action-button';

export interface DownloadActionProps extends ActionButtonProps {
  blob?: Blob | null;
  imageUrl?: string;
  filename?: string;
  /**
   * Toast message shown on successful download trigger.
   * - string: displays custom message (e.g. `Downloaded ${filename}`)
   * - true: displays default `Downloaded ${filename}`
   * - undefined / false: no success toast is shown
   */
  successToast?: string | boolean;
  /**
   * Toast message shown when download fails (e.g. fetch fails).
   * - string: displays custom error message
   * - true / undefined: displays default 'Failed to download file'
   * - false: suppresses error toast
   */
  errorToast?: string | boolean;
}
