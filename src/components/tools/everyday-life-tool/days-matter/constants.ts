import type { MilestoneState, PosterAspectRatio, PosterTheme } from './types';

import { Monitor, Smartphone, Square } from 'lucide-react';

export const DAYS_MATTER_SAVED_STORAGE_KEY = 'days-matter-saved-milestones';
export const MAX_TITLE_LENGTH = 48;
export const MAX_NOTE_LENGTH = 90;

export const POSTER_THEMES: readonly PosterTheme[] = [
  {
    id: 'aurora',
    label: 'Aurora Night',
    gradientCss:
      'linear-gradient(135deg, #0f172a 0%, #312e81 52%, #0e7490 100%)',
    canvasStops: ['#0f172a', '#312e81', '#0e7490'],
    glowColor: 'rgba(56, 189, 248, 0.28)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    pillBg: 'rgba(255, 255, 255, 0.12)',
    pillBorder: 'rgba(255, 255, 255, 0.22)',
    accent: '#38bdf8',
    isDark: true,
  },
  {
    id: 'sunset',
    label: 'Golden Sunset',
    gradientCss:
      'linear-gradient(135deg, #431407 0%, #c2410c 50%, #f59e0b 100%)',
    canvasStops: ['#431407', '#c2410c', '#f59e0b'],
    glowColor: 'rgba(253, 224, 71, 0.25)',
    textPrimary: '#fffbeb',
    textSecondary: '#fed7aa',
    pillBg: 'rgba(255, 255, 255, 0.14)',
    pillBorder: 'rgba(255, 255, 255, 0.25)',
    accent: '#fde68a',
    isDark: true,
  },
  {
    id: 'ocean',
    label: 'Pacific Mist',
    gradientCss:
      'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 52%, #e0e7ff 100%)',
    canvasStops: ['#f0f9ff', '#bae6fd', '#e0e7ff'],
    glowColor: 'rgba(14, 165, 233, 0.18)',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    pillBg: 'rgba(255, 255, 255, 0.65)',
    pillBorder: 'rgba(14, 165, 233, 0.25)',
    accent: '#0284c7',
    isDark: false,
  },
  {
    id: 'rose',
    label: 'Blush Velvet',
    gradientCss:
      'linear-gradient(135deg, #fff1f2 0%, #fecdd3 52%, #f5d0fe 100%)',
    canvasStops: ['#fff1f2', '#fecdd3', '#f5d0fe'],
    glowColor: 'rgba(244, 63, 94, 0.18)',
    textPrimary: '#4c0519',
    textSecondary: '#881337',
    pillBg: 'rgba(255, 255, 255, 0.68)',
    pillBorder: 'rgba(244, 63, 94, 0.22)',
    accent: '#e11d48',
    isDark: false,
  },
  {
    id: 'minimal',
    label: 'Editorial Paper',
    gradientCss:
      'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 55%, #e7e5e4 100%)',
    canvasStops: ['#fafaf9', '#f5f5f4', '#e7e5e4'],
    glowColor: 'rgba(120, 113, 108, 0.12)',
    textPrimary: '#1c1917',
    textSecondary: '#57534e',
    pillBg: 'rgba(255, 255, 255, 0.82)',
    pillBorder: 'rgba(168, 162, 158, 0.35)',
    accent: '#292524',
    isDark: false,
  },
  {
    id: 'obsidian',
    label: 'Monochrome Noir',
    gradientCss:
      'linear-gradient(135deg, #09090b 0%, #18181b 55%, #27272a 100%)',
    canvasStops: ['#09090b', '#18181b', '#27272a'],
    glowColor: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.18)',
    accent: '#f4f4f5',
    isDark: true,
  },
];

export const POSTER_RATIO_TABS: PosterAspectRatio[] = [
  'story',
  'square',
  'wide',
];

export const POSTER_RATIO_LABELS: Record<PosterAspectRatio, string> = {
  story: '9:16 Story',
  square: '1:1 Post',
  wide: '16:9 Banner',
};

export const POSTER_RATIO_ICONS = {
  story: Smartphone,
  square: Square,
  wide: Monitor,
};

export const POSTER_RATIO_DIMENSIONS: Record<
  PosterAspectRatio,
  { width: number; height: number; badge: string }
> = {
  story: { width: 1080, height: 1920, badge: '1080×1920 · 9:16' },
  square: { width: 1080, height: 1080, badge: '1080×1080 · 1:1' },
  wide: { width: 1600, height: 900, badge: '1600×900 · 16:9' },
};

export const DEFAULT_MILESTONE_STATE: MilestoneState = {
  title: 'New Year Celebration',
  date: '',
  note: 'Every day counts toward something meaningful.',
  themeId: 'aurora',
  ratio: 'story',
  showLiveClock: true,
};

export const SAMPLE_MILESTONE_STATE: MilestoneState = {
  title: 'Tokyo Spring Trip',
  date: '2027-04-01',
  note: 'Cherry blossoms, pour-over coffee, and slow mornings.',
  themeId: 'sunset',
  ratio: 'square',
  showLiveClock: true,
};
