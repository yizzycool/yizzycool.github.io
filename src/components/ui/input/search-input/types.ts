import type { Ref } from 'react';
import type { InputProps } from '../input/types';
import type { BadgeSize } from '@/types/common/badge';

export interface SearchInputProps extends Omit<InputProps, 'icon'> {
  /** Hotkey symbol hint displayed inside the input when empty (e.g. '/' or 'Mod+K') */
  hotkey?: string;
  /** Size variant for the HotkeyBadge (default: 'sm') */
  hotkeySize?: BadgeSize;
  /** Ref forwarded to the inner HTMLInputElement */
  inputRef?: Ref<HTMLInputElement>;
  /** Optional class name for the outer container wrapper */
  containerClassName?: string;
}
