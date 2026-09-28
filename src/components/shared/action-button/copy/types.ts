import type { ActionButtonProps } from '@/types/common/action-button';

export interface CopyActionProps extends ActionButtonProps {
  content?: string | Blob | null;
  /**
   * Toast message shown on successful copy.
   * - string: displays custom message (e.g. `Copied ${label}!`)
   * - true: displays default 'Copied to clipboard'
   * - undefined / false: no success toast is shown
   */
  successToast?: string | boolean;
  /**
   * Toast message shown when copy fails.
   * - string: displays custom error message
   * - true / undefined: displays default 'Failed to copy to clipboard'
   * - false: suppresses error toast
   */
  errorToast?: string | boolean;
  /** Callback invoked on successful copy */
  onSuccess?: () => void;
  /** Callback invoked when copy fails */
  onError?: (error: unknown) => void;
}
