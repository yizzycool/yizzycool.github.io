import type { HotkeyItem } from '@/components/ui/badge';

export const DETECTION_SHORTCUTS: HotkeyItem[] = [
  {
    symbol: 'Mod + V',
    label: 'Paste Image from Clipboard',
    hint: 'Quickly load screenshot or copied image directly from clipboard',
  },
  {
    symbol: 'Esc',
    label: 'Clear / Stop Detection',
    hint: 'Clear current loaded media or stop active webcam stream',
  },
  {
    symbol: 'Mod + Shift + C',
    label: 'Copy Detection Result',
    hint: 'Copy decoded barcode text, OCR detected text, or detection data',
  },
  {
    symbol: '1 / 2 / 3',
    label: 'Switch Input Mode',
    hint: '1: Image, 2: Video, 3: Webcam',
  },
  {
    symbol: 'F',
    label: 'Flip Webcam Camera',
    hint: 'Switch between front and back cameras when webcam is active',
  },
  {
    symbol: '?',
    label: 'Keyboard Shortcuts Help',
  },
];
