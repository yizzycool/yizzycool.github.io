export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export type WifiCardThemeId = 'nordic' | 'cafe' | 'midnight' | 'botanical';

export type WifiCardLayout = 'portrait' | 'landscape' | 'compact';

export interface WifiCardTheme {
  id: WifiCardThemeId;
  label: string;
  description: string;
  cardBg: string;
  cardBorder: string;
  surfaceBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  qrFg: string;
  qrBg: string;
  isDark: boolean;
}

export interface WifiCardState {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
  themeId: WifiCardThemeId;
  layout: WifiCardLayout;
  title: string;
  subtitle: string;
  showPassword: boolean;
  showCutGuides: boolean;
}
