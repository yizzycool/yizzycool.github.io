import type { Rounded } from '@/types/common';
import type { BadgeSize } from '@/types/common/badge';

export type HotkeySymbol =
  | 'Mod + Enter'
  | 'Mod + Shift + C'
  | 'Mod + Shift + V'
  | 'Esc'
  | 'Mod + /'
  | '?'
  | 'Mod + S'
  | 'Mod + H'
  | 'Mod + K';

export type HotkeyBadgeColor = 'neutral' | 'ghost' | 'inverted' | 'surface';
export type HotkeyBadgeLayout = 'split' | 'combined';

export type HotkeyItem = {
  symbol: string;
  label?: string;
  hint?: string;
};

export type HotkeyBadgeProps = {
  /** Color theme of the badge (default: 'neutral') */
  color?: HotkeyBadgeColor;
  /** Layout display mode: 'split' or 'combined' (default: 'split') */
  layout?: HotkeyBadgeLayout;
  /** Size variant of the badge (default: 'xs') */
  size?: BadgeSize;
  /** Border radius of the badge (default: 'base') */
  rounded?: Rounded;
  /** Whether the keycap has a border (default: true) */
  bordered?: boolean;
  /** Array of hotkey items to render as a group */
  items?: HotkeyItem[];
  /** Single hotkey symbol */
  symbol?: string;
  /** Single hotkey label (e.g. "Format") */
  label?: string;
  className?: string;
};
