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
}
