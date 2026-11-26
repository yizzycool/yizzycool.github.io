export type PosterAspectRatio = 'story' | 'square' | 'wide';

export type PosterThemeId =
  | 'aurora'
  | 'sunset'
  | 'ocean'
  | 'rose'
  | 'minimal'
  | 'obsidian';

export interface PosterTheme {
  id: PosterThemeId;
  label: string;
  gradientCss: string;
  canvasStops: readonly [string, string, string];
  glowColor: string;
  textPrimary: string;
  textSecondary: string;
  pillBg: string;
  pillBorder: string;
  accent: string;
  isDark: boolean;
}

export interface MilestoneState {
  title: string;
  date: string;
  note: string;
  themeId: PosterThemeId;
  ratio: PosterAspectRatio;
  showLiveClock: boolean;
}

export interface SavedMilestone {
  id: string;
  title: string;
  date: string;
  note: string;
  themeId: PosterThemeId;
  ratio: PosterAspectRatio;
}

export interface CountdownBreakdown {
  mode: 'future' | 'past' | 'today';
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedDate: string;
  weekday: string;
  totalWeeks: string;
  isValid: boolean;
}
