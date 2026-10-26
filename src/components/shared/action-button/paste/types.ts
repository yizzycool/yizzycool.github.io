import type { ActionButtonProps } from '@/types/common/action-button';

export type PasteInputType = 'string' | 'image';

export type OnTextPaste = (text: string) => void;
export type OnImagePaste = (blob: Blob) => void;

export type PasteOnClick<T extends PasteInputType> = T extends 'string'
  ? OnTextPaste
  : OnImagePaste;

export interface PasteActionProps<T extends PasteInputType>
  extends ActionButtonProps {
  onClick?: PasteOnClick<T>;
  type?: T;
  /**
   * Toast message shown on successful paste.
   * - string: displays custom message (e.g. 'Pasted from clipboard')
   * - true: displays default 'Pasted from clipboard'
   * - undefined / false: no success toast is shown
   */
  successToast?: string | boolean;
  /**
   * Toast message shown when paste fails (e.g. permission denied or clipboard empty).
   * - string: displays custom error message
   * - true / undefined: displays default 'Failed to read from clipboard'
   * - false: suppresses error toast
   */
  errorToast?: string | boolean;
}
