import type { HotkeyItem } from '@/components/ui/badge';

export const FOCUS_MODAL_SHORTCUTS: HotkeyItem[] = [
  {
    symbol: '1-9',
    label: 'tabs',
  },
  {
    symbol: '← →',
    label: 'prev/next',
  },
  {
    symbol: 'Mod+C',
    label: 'copy',
  },
  {
    symbol: 'E',
    label: 'edit',
  },
];

export const FOCUS_MODAL_CLOSE_SHORTCUT: HotkeyItem = {
  symbol: 'Esc',
  label: 'close',
};
