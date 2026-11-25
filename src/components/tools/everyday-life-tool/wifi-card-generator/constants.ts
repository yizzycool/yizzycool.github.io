import type { WifiCardLayout, WifiCardState, WifiCardTheme } from './types';

import { RectangleHorizontal, RectangleVertical, Square } from 'lucide-react';

export const WIFI_CARD_STORAGE_KEY = 'wifi-card-generator-draft';

export const WIFI_CARD_THEMES: readonly WifiCardTheme[] = [
  {
    id: 'nordic',
    label: 'Nordic Minimal',
    description: 'Clean studio white & sky blue',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    surfaceBg: '#f8fafc',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#0284c7',
    accentSoft: '#e0f2fe',
    qrFg: '#0f172a',
    qrBg: '#ffffff',
    isDark: false,
  },
  {
    id: 'cafe',
    label: 'Cafe Kraft',
    description: 'Warm espresso & cream paper',
    cardBg: '#fdf8f3',
    cardBorder: '#e7d8c9',
    surfaceBg: '#f5ebe0',
    textPrimary: '#3e2723',
    textSecondary: '#795548',
    accent: '#b45309',
    accentSoft: '#fef3c7',
    qrFg: '#2d1b15',
    qrBg: '#ffffff',
    isDark: false,
  },
  {
    id: 'midnight',
    label: 'Obsidian Dark',
    description: 'Sleek charcoal & cool slate',
    cardBg: '#111827',
    cardBorder: '#334155',
    surfaceBg: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#38bdf8',
    accentSoft: '#0c4a6e',
    qrFg: '#0f172a',
    qrBg: '#ffffff',
    isDark: true,
  },
  {
    id: 'botanical',
    label: 'Sage Studio',
    description: 'Calm botanical green tint',
    cardBg: '#f4f9f6',
    cardBorder: '#cde4d6',
    surfaceBg: '#e6f2eb',
    textPrimary: '#14532d',
    textSecondary: '#4d7c5d',
    accent: '#15803d',
    accentSoft: '#dcfce7',
    qrFg: '#052e16',
    qrBg: '#ffffff',
    isDark: false,
  },
];

export const WIFI_ENCRYPTION_OPTIONS = [
  { label: 'WPA / WPA2 / WPA3', value: 'WPA' },
  { label: 'WEP (Legacy)', value: 'WEP' },
  { label: 'Open (No Password)', value: 'nopass' },
];

export const WIFI_LAYOUT_TABS: WifiCardLayout[] = [
  'portrait',
  'landscape',
  'compact',
];

export const WIFI_LAYOUT_LABELS: Record<WifiCardLayout, string> = {
  portrait: 'Table Tent',
  landscape: 'Guest Card',
  compact: 'Sticker',
};

export const WIFI_LAYOUT_DIMENSIONS: Record<
  WifiCardLayout,
  { printLabel: string; widthIn: string; heightIn: string }
> = {
  portrait: {
    printLabel: '5×7 in · Table Tent',
    widthIn: '5in',
    heightIn: '7in',
  },
  landscape: {
    printLabel: '7×5 in · Guest Card',
    widthIn: '7in',
    heightIn: '5in',
  },
  compact: {
    printLabel: '3.5×3.5 in · Sticker',
    widthIn: '3.5in',
    heightIn: '3.5in',
  },
};

export const WIFI_LAYOUT_ICONS = {
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
  compact: Square,
};

export const DEFAULT_WIFI_CARD_STATE: WifiCardState = {
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
  themeId: 'nordic',
  layout: 'portrait',
  title: 'Welcome to Our Wi-Fi',
  subtitle: 'Point your phone camera at the QR code to join automatically.',
  showPassword: true,
  showCutGuides: true,
};

export const SAMPLE_WIFI_CARD_STATE: WifiCardState = {
  ssid: 'YizzyCafe_5G',
  password: 'latte-art-2026',
  encryption: 'WPA',
  hidden: false,
  themeId: 'cafe',
  layout: 'portrait',
  title: 'Welcome to Yizzy Cafe',
  subtitle: 'Scan the QR code with your phone camera to join guest Wi-Fi.',
  showPassword: true,
  showCutGuides: true,
};
