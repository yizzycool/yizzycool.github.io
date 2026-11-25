export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak';

export type SoundTrackId = 'brown' | 'pink' | 'rain' | 'waves' | 'binaural';

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  enableChime: boolean;
}

export type SoundTrackVolumes = Record<SoundTrackId, number>;

export interface SoundTrackMeta {
  id: SoundTrackId;
  label: string;
  subtitle: string;
  accentClass: string;
}

export interface SoundMixPreset {
  id: string;
  label: string;
  volumes: SoundTrackVolumes;
}

export interface DailyFocusStats {
  date: string;
  completedSessions: number;
  focusedMinutes: number;
}
