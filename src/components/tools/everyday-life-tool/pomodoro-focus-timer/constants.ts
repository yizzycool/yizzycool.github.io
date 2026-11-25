import type {
  SoundMixPreset,
  SoundTrackMeta,
  SoundTrackVolumes,
  TimerPhase,
  TimerSettings,
} from './types';

export const POMODORO_SETTINGS_STORAGE_KEY = 'pomodoro-focus-timer-settings';
export const POMODORO_STATS_STORAGE_KEY = 'pomodoro-focus-timer-stats';

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  enableChime: true,
};

export const TIMER_PHASE_TABS: TimerPhase[] = [
  'focus',
  'shortBreak',
  'longBreak',
];

export const TIMER_PHASE_LABELS: Record<TimerPhase, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const TIMER_PHASE_ACCENTS: Record<
  TimerPhase,
  {
    stroke: string;
    ringBg: string;
    badgeText: string;
    buttonBg: string;
  }
> = {
  focus: {
    stroke: 'stroke-sky-500 dark:stroke-sky-400',
    ringBg: 'text-sky-500/10 dark:text-sky-400/15',
    badgeText: 'text-sky-600 dark:text-sky-400',
    buttonBg: 'bg-sky-600 hover:bg-sky-700',
  },
  shortBreak: {
    stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
    ringBg: 'text-emerald-500/10 dark:text-emerald-400/15',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
  },
  longBreak: {
    stroke: 'stroke-indigo-500 dark:stroke-indigo-400',
    ringBg: 'text-indigo-500/10 dark:text-indigo-400/15',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
  },
};

export const SOUND_TRACKS: readonly SoundTrackMeta[] = [
  {
    id: 'brown',
    label: 'Brown Noise',
    subtitle: 'Deep low-end rumble',
    accentClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'pink',
    label: 'Pink Noise',
    subtitle: 'Warm balanced mask',
    accentClass: 'text-rose-500 dark:text-rose-400',
  },
  {
    id: 'rain',
    label: 'Rainfall',
    subtitle: 'Soft filtered shower',
    accentClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    subtitle: 'Slow rhythmic surf',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'binaural',
    label: 'Alpha Binaural',
    subtitle: '10 Hz stereo wave',
    accentClass: 'text-violet-600 dark:text-violet-400',
  },
];

export const DEFAULT_SOUND_VOLUMES: SoundTrackVolumes = {
  brown: 0,
  pink: 0,
  rain: 0,
  waves: 0,
  binaural: 0,
};

export const SOUND_MIX_PRESETS: readonly SoundMixPreset[] = [
  {
    id: 'deep-code',
    label: 'Deep Code',
    volumes: { brown: 55, pink: 15, rain: 20, waves: 0, binaural: 15 },
  },
  {
    id: 'rainy-cafe',
    label: 'Rainy Studio',
    volumes: { brown: 15, pink: 25, rain: 65, waves: 0, binaural: 0 },
  },
  {
    id: 'ocean-calm',
    label: 'Ocean Calm',
    volumes: { brown: 10, pink: 15, rain: 0, waves: 70, binaural: 0 },
  },
  {
    id: 'alpha-focus',
    label: 'Alpha Flow',
    volumes: { brown: 35, pink: 0, rain: 15, waves: 0, binaural: 35 },
  },
  {
    id: 'silence',
    label: 'Mute All',
    volumes: DEFAULT_SOUND_VOLUMES,
  },
];
