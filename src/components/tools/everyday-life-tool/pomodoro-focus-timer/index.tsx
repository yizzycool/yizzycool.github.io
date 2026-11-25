'use client';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import { usePomodoroTimer } from './hooks/use-pomodoro-timer';
import SoundscapeMixer from './soundscape-mixer';
import TimerSettingsDialog from './timer-settings-dialog';
import TimerStage from './timer-stage';

/**
 * Pomodoro focus timer & procedural Web Audio ambient soundscape studio (Archetype C).
 */
export default function PomodoroFocusTimer() {
  const {
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
  } = usePomodoroTimer();

  return (
    <>
      <HeaderBlock
        customShortcuts={customShortcuts}
        headerAction={
          <TimerSettingsDialog settings={settings} onSave={updateSettings} />
        }
      />

      <SectionGap />

      <TimerStage
        phase={phase}
        secondsLeft={secondsLeft}
        phaseTotalSeconds={phaseTotalSeconds}
        isRunning={isRunning}
        completedCycleCount={completedCycleCount}
        sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
        focusTask={focusTask}
        onChangeFocusTask={setFocusTask}
        todayStats={todayStats}
        isNotificationSupported={isNotificationSupported}
        notificationPermission={notificationPermission}
        customShortcuts={customShortcuts}
        onSelectPhase={selectPhase}
        onToggleStartPause={toggleStartPause}
        onReset={resetTimer}
        onSkip={skipPhase}
        onRequestNotifications={requestNotifications}
      />

      <SoundscapeMixer
        volumes={volumes}
        masterVolume={masterVolume}
        isMuted={isMuted}
        activeTrackCount={activeTrackCount}
        onTrackToggle={toggleTrack}
        onTrackVolumeChange={setTrackVolume}
        onMasterVolumeChange={setMasterVolume}
        onToggleMute={toggleMute}
        onApplyPreset={applyPreset}
      />
    </>
  );
}
