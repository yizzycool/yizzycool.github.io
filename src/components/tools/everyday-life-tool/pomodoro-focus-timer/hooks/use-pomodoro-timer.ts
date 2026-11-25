'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type {
  DailyFocusStats,
  SoundTrackId,
  SoundTrackVolumes,
  TimerPhase,
  TimerSettings,
} from '../types';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  hasOpenModalDialog,
  TOOL_HOTKEYS,
} from '@/hooks/tools/use-tool-hotkeys';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import toast from '@/utils/toast';

import {
  DEFAULT_SOUND_VOLUMES,
  DEFAULT_TIMER_SETTINGS,
  POMODORO_SETTINGS_STORAGE_KEY,
  POMODORO_STATS_STORAGE_KEY,
  TIMER_PHASE_LABELS,
} from '../constants';
import { SoundscapeEngine } from '../utils/soundscape-engine';

const NOTIFICATION_PERM_EVENT = 'yizzypeasy-notification-permission-update';

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPhaseDurationSeconds(
  phase: TimerPhase,
  settings: TimerSettings
): number {
  if (phase === 'focus') return settings.focusMinutes * 60;
  if (phase === 'shortBreak') return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function emptySubscribe(): () => void {
  return () => {};
}

function subscribeNotificationPermission(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(NOTIFICATION_PERM_EVENT, cb);
  return () => window.removeEventListener(NOTIFICATION_PERM_EVENT, cb);
}

function checkNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function getNotificationPermissionSnapshot():
  | NotificationPermission
  | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

function getServerNotificationUnsupported(): 'unsupported' {
  return 'unsupported';
}

function getBoolFalse(): boolean {
  return false;
}

export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Coordinates drift-resistant Pomodoro countdown, session cycles, notifications, and Web Audio soundscape mixer.
 */
export function usePomodoroTimer() {
  const { value: storedSettings, setValue: setStoredSettings } =
    useLocalStorage<Partial<TimerSettings>>(
      POMODORO_SETTINGS_STORAGE_KEY,
      DEFAULT_TIMER_SETTINGS
    );

  const settings = useMemo<TimerSettings>(
    () => ({
      ...DEFAULT_TIMER_SETTINGS,
      ...storedSettings,
    }),
    [storedSettings]
  );

  const { value: storedStats, setValue: setStoredStats } =
    useLocalStorage<DailyFocusStats>(POMODORO_STATS_STORAGE_KEY, {
      date: '',
      completedSessions: 0,
      focusedMinutes: 0,
    });

  const todayKey = getTodayKey();
  const todayStats = useMemo<DailyFocusStats>(() => {
    if (storedStats.date === todayKey) return storedStats;
    return { date: todayKey, completedSessions: 0, focusedMinutes: 0 };
  }, [storedStats, todayKey]);

  const isNotificationSupported = useSyncExternalStore(
    emptySubscribe,
    checkNotificationSupported,
    getBoolFalse
  );

  const notificationPermission = useSyncExternalStore(
    subscribeNotificationPermission,
    getNotificationPermissionSnapshot,
    getServerNotificationUnsupported
  );

  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(
    DEFAULT_TIMER_SETTINGS.focusMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycleCount, setCompletedCycleCount] = useState(0);
  const [focusTask, setFocusTask] = useState('');

  const [volumes, setVolumes] = useState<SoundTrackVolumes>(
    DEFAULT_SOUND_VOLUMES
  );
  const [masterVolume, setMasterVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const baseTitleRef = useRef<string | null>(null);
  const engineRef = useRef<SoundscapeEngine | null>(null);

  const getEngine = useCallback((): SoundscapeEngine => {
    if (!engineRef.current) {
      engineRef.current = new SoundscapeEngine();
    }
    return engineRef.current;
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const phaseTotalSeconds = useMemo(
    () => getPhaseDurationSeconds(phase, settings),
    [phase, settings]
  );

  const notifyPhaseFinished = useCallback(
    (finishedPhase: TimerPhase) => {
      if (settings.enableChime) {
        getEngine().playCompletionChime();
      }

      const title =
        finishedPhase === 'focus' ? 'Focus Session Complete' : 'Break Over';
      const body =
        finishedPhase === 'focus'
          ? 'Great work! Time for a short breather.'
          : 'Ready for the next deep focus sprint?';

      if (finishedPhase === 'focus') {
        toast.success(title);
      } else {
        toast.info(title);
      }

      if (isNotificationSupported && notificationPermission === 'granted') {
        try {
          new Notification(title, { body });
        } catch {
          // Ignore browser notification exceptions
        }
      }
    },
    [
      getEngine,
      isNotificationSupported,
      notificationPermission,
      settings.enableChime,
    ]
  );

  const advancePhase = useCallback(
    (completedNaturally: boolean) => {
      if (completedNaturally) {
        notifyPhaseFinished(phase);
      }

      let nextPhase: TimerPhase = 'focus';
      let nextCycle = completedCycleCount;

      if (phase === 'focus') {
        if (completedNaturally) {
          setStoredStats({
            date: todayKey,
            completedSessions: todayStats.completedSessions + 1,
            focusedMinutes: todayStats.focusedMinutes + settings.focusMinutes,
          });
        }
        nextCycle = completedCycleCount + 1;
        setCompletedCycleCount(nextCycle);
        nextPhase =
          nextCycle % settings.sessionsBeforeLongBreak === 0
            ? 'longBreak'
            : 'shortBreak';
      } else {
        nextPhase = 'focus';
      }

      const nextDuration = getPhaseDurationSeconds(nextPhase, settings);
      const shouldAutoStart =
        completedNaturally &&
        (nextPhase === 'focus'
          ? settings.autoStartFocus
          : settings.autoStartBreaks);

      setPhase(nextPhase);
      setSecondsLeft(nextDuration);

      if (shouldAutoStart) {
        endTimeRef.current = Date.now() + nextDuration * 1000;
        setIsRunning(true);
      } else {
        endTimeRef.current = null;
        setIsRunning(false);
      }
    },
    [
      completedCycleCount,
      notifyPhaseFinished,
      phase,
      setStoredStats,
      settings,
      todayKey,
      todayStats.completedSessions,
      todayStats.focusedMinutes,
    ]
  );

  // Drift-resistant interval ticker while running
  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null;
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    const timerId = window.setInterval(() => {
      if (endTimeRef.current === null) return;
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        window.clearInterval(timerId);
        advancePhase(true);
      } else {
        setSecondsLeft(remaining);
      }
    }, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [advancePhase, isRunning, secondsLeft]);

  // Sync browser tab title while timer is running
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title;
    }

    if (isRunning) {
      document.title = `${formatClock(secondsLeft)} · ${TIMER_PHASE_LABELS[phase]}`;
    } else if (baseTitleRef.current !== null) {
      document.title = baseTitleRef.current;
    }

    return () => {
      if (baseTitleRef.current !== null) {
        document.title = baseTitleRef.current;
      }
    };
  }, [isRunning, phase, secondsLeft]);

  const selectPhase = useCallback(
    (nextPhase: TimerPhase) => {
      endTimeRef.current = null;
      setIsRunning(false);
      setPhase(nextPhase);
      setSecondsLeft(getPhaseDurationSeconds(nextPhase, settings));
    },
    [settings]
  );

  const toggleStartPause = useCallback(() => {
    setIsRunning((prev) => {
      if (prev) {
        endTimeRef.current = null;
        return false;
      }
      endTimeRef.current = Date.now() + secondsLeft * 1000;
      return true;
    });
  }, [secondsLeft]);

  const resetTimer = useCallback(() => {
    endTimeRef.current = null;
    setIsRunning(false);
    setSecondsLeft(getPhaseDurationSeconds(phase, settings));
  }, [phase, settings]);

  const skipPhase = useCallback(() => {
    advancePhase(false);
  }, [advancePhase]);

  const updateSettings = useCallback(
    (nextSettings: TimerSettings) => {
      setStoredSettings(nextSettings);
      if (!isRunning) {
        setSecondsLeft(getPhaseDurationSeconds(phase, nextSettings));
      }
      toast.success('Timer settings saved');
    },
    [isRunning, phase, setStoredSettings]
  );

  const requestNotifications = useCallback(async () => {
    if (!isNotificationSupported) {
      toast.info('Browser notifications are unavailable in this browser');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      window.dispatchEvent(new Event(NOTIFICATION_PERM_EVENT));
      if (result === 'granted') {
        toast.success('Desktop notifications enabled');
      } else if (result === 'denied') {
        toast.info('Notifications blocked in browser site settings');
      }
    } catch {
      toast.error('Unable to request notification permission');
    }
  }, [isNotificationSupported]);

  const setTrackVolume = useCallback(
    (id: SoundTrackId, value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      setVolumes((prev) => ({ ...prev, [id]: clamped }));
      getEngine().setTrackVolume(id, clamped);
    },
    [getEngine]
  );

  const toggleTrack = useCallback(
    (id: SoundTrackId) => {
      const current = volumes[id];
      const next = current > 0 ? 0 : 45;
      setTrackVolume(id, next);
    },
    [setTrackVolume, volumes]
  );

  const applyPreset = useCallback(
    (presetVolumes: SoundTrackVolumes) => {
      setVolumes(presetVolumes);
      getEngine().setAllVolumes(presetVolumes);
    },
    [getEngine]
  );

  const setMasterVolume = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      setMasterVolumeState(clamped);
      getEngine().setMasterVolume(clamped);
    },
    [getEngine]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      getEngine().setMuted(next);
      return next;
    });
  }, [getEngine]);

  // Global Space (Play/Pause), Alt+N (Next Phase), Esc (Reset) guarded against inputs & dialogs
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasOpenModalDialog()) return;

      const active = document.activeElement;
      const isEditing =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable);

      if (event.code === 'Space' && !event.metaKey && !event.ctrlKey) {
        if (isEditing || active?.tagName === 'BUTTON') return;
        event.preventDefault();
        toggleStartPause();
        return;
      }

      if (event.altKey && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        skipPhase();
        return;
      }

      if (event.key === 'Escape' && !isEditing) {
        event.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetTimer, skipPhase, toggleStartPause]);

  const customShortcuts = useMemo<HotkeyItem[]>(
    () => [
      { symbol: 'Space', label: 'Start / Pause Timer' },
      { symbol: 'Alt + N', label: 'Skip to Next Phase' },
      { symbol: 'Esc', label: 'Reset Active Timer' },
      TOOL_HOTKEYS.help,
    ],
    []
  );

  const activeTrackCount = useMemo(
    () => Object.values(volumes).filter((v) => v > 0).length,
    [volumes]
  );

  return {
    phase,
    secondsLeft,
    phaseTotalSeconds,
    isRunning,
    completedCycleCount,
    focusTask,
    setFocusTask,
    settings,
    todayStats,
    isNotificationSupported,
    notificationPermission,
    volumes,
    masterVolume,
    isMuted,
    activeTrackCount,
    customShortcuts,
    selectPhase,
    toggleStartPause,
    resetTimer,
    skipPhase,
    updateSettings,
    requestNotifications,
    setTrackVolume,
    toggleTrack,
    applyPreset,
    setMasterVolume,
    toggleMute,
  };
}
