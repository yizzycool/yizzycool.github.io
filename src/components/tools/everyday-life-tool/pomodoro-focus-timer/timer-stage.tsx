'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type { DailyFocusStats, TimerPhase } from './types';

import {
  Bell,
  BellOff,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Target,
} from 'lucide-react';

import { HotkeyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  TIMER_PHASE_ACCENTS,
  TIMER_PHASE_LABELS,
  TIMER_PHASE_TABS,
} from './constants';
import { formatClock } from './hooks/use-pomodoro-timer';

const RING_SIZE = 264;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type Props = {
  phase: TimerPhase;
  secondsLeft: number;
  phaseTotalSeconds: number;
  isRunning: boolean;
  completedCycleCount: number;
  sessionsBeforeLongBreak: number;
  focusTask: string;
  onChangeFocusTask: (value: string) => void;
  todayStats: DailyFocusStats;
  isNotificationSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  customShortcuts: HotkeyItem[];
  onSelectPhase: (phase: TimerPhase) => void;
  onToggleStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onRequestNotifications: () => void;
};

/**
 * Centered Zen circular focus timer stage with mode selector, intention input, and transport controls.
 */
export default function TimerStage({
  phase,
  secondsLeft,
  phaseTotalSeconds,
  isRunning,
  completedCycleCount,
  sessionsBeforeLongBreak,
  focusTask,
  onChangeFocusTask,
  todayStats,
  isNotificationSupported,
  notificationPermission,
  customShortcuts,
  onSelectPhase,
  onToggleStartPause,
  onReset,
  onSkip,
  onRequestNotifications,
}: Props) {
  const accent = TIMER_PHASE_ACCENTS[phase];
  const progress =
    phaseTotalSeconds > 0
      ? Math.max(0, Math.min(1, secondsLeft / phaseTotalSeconds))
      : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  const completedInCycle = completedCycleCount % sessionsBeforeLongBreak;
  const cycleDots = Array.from(
    { length: sessionsBeforeLongBreak },
    (_, i) => i
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-neutral-200/80 bg-white/75 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-neutral-800/80 dark:bg-neutral-900/55">
      {/* Phase Mode Switcher */}
      <Tabs<TimerPhase>
        tabs={TIMER_PHASE_TABS}
        activeTab={phase}
        onChange={onSelectPhase}
        tabLabels={TIMER_PHASE_LABELS}
        size="sm"
        variant="segment"
        className="mb-5"
      />

      {/* Current Task Intention */}
      <div className="mb-6 w-full max-w-xs">
        <Input
          id="pomodoro-focus-task"
          icon={Target}
          value={focusTask}
          onChange={(e) => onChangeFocusTask(e.target.value)}
          onClear={() => onChangeFocusTask('')}
          placeholder="What are you focusing on?"
          className="text-center font-sans text-xs"
        />
      </div>

      {/* Circular Progress Ring & Clock Readout */}
      <div className="relative flex items-center justify-center">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90 transform"
          aria-hidden="true"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            className="text-neutral-200/80 dark:text-neutral-800"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-[stroke-dashoffset] duration-300 ease-linear',
              accent.stroke
            )}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              'mb-1 text-[11px] font-bold uppercase tracking-widest',
              accent.badgeText
            )}
          >
            {TIMER_PHASE_LABELS[phase]}
          </span>
          <time
            aria-live="off"
            className="font-mono text-5xl font-bold tabular-nums tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-50"
          >
            {formatClock(secondsLeft)}
          </time>

          {/* Session Cycle Dots */}
          <div
            className="mt-3 flex items-center gap-1.5"
            aria-label={`Completed ${completedInCycle} of ${sessionsBeforeLongBreak} focus sessions before long break`}
          >
            {cycleDots.map((dotIndex) => (
              <span
                key={dotIndex}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  dotIndex < completedInCycle
                    ? 'bg-sky-500 dark:bg-sky-400'
                    : 'bg-neutral-300/80 dark:bg-neutral-700'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          rounded="full"
          bordered
          icon={RotateCcw}
          onClick={onReset}
          ariaLabel="Reset current timer"
        >
          Reset
        </Button>

        <Button
          variant="primary"
          size="base"
          rounded="full"
          icon={isRunning ? Pause : Play}
          onClick={onToggleStartPause}
          ariaLabel={isRunning ? 'Pause timer' : 'Start timer'}
          className={cn(
            'min-w-[132px] justify-center font-semibold shadow-sm',
            accent.buttonBg
          )}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          rounded="full"
          bordered
          icon={SkipForward}
          onClick={onSkip}
          ariaLabel="Skip to next phase"
        >
          Next
        </Button>

        {isNotificationSupported && (
          <Button
            variant={
              notificationPermission === 'granted' ? 'secondary' : 'ghost'
            }
            size="sm"
            rounded="full"
            bordered
            icon={notificationPermission === 'granted' ? Bell : BellOff}
            onClick={onRequestNotifications}
            title={
              notificationPermission === 'granted'
                ? 'Desktop alerts enabled'
                : 'Enable desktop alerts'
            }
            ariaLabel="Toggle desktop alerts"
            className={
              notificationPermission === 'granted'
                ? 'text-emerald-600 dark:text-emerald-400'
                : undefined
            }
          />
        )}
      </div>

      {/* Today Focus Stats & Hotkeys */}
      <div className="mt-7 flex w-full flex-col items-center justify-between gap-3 border-t border-neutral-200/70 pt-4 sm:flex-row dark:border-neutral-800/70">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>
            Today:{' '}
            <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
              {todayStats.completedSessions}
            </strong>{' '}
            {todayStats.completedSessions === 1 ? 'session' : 'sessions'} ·{' '}
            <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
              {todayStats.focusedMinutes}
            </strong>{' '}
            min focused
          </span>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <HotkeyBadge items={customShortcuts.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}
