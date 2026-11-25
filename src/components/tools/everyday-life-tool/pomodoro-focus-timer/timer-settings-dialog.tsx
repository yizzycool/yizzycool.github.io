'use client';

import type { TimerSettings } from './types';

import { useState } from 'react';
import { RotateCcw, Settings2 } from 'lucide-react';

import { ConfigDialog } from '@/components/shared/config-dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import { DEFAULT_TIMER_SETTINGS } from './constants';

type Props = {
  settings: TimerSettings;
  onSave: (nextSettings: TimerSettings) => void;
};

/**
 * Header-mounted ConfigDialog trigger & modal body for customizing Pomodoro intervals and automation.
 */
export default function TimerSettingsDialog({ settings, onSave }: Props) {
  const [draft, setDraft] = useState<TimerSettings>(settings);

  const handleOpenResetDraft = () => {
    setDraft(settings);
  };

  const handleSave = () => {
    onSave(draft);
    customEventUtils.emit(CustomEvents.common.toggleConfigDialog);
  };

  const handleResetDefaults = () => {
    setDraft(DEFAULT_TIMER_SETTINGS);
  };

  return (
    <ConfigDialog
      title="Timer Settings"
      icon={Settings2}
      onClick={handleOpenResetDraft}
    >
      <div className="space-y-5 px-5 py-6 sm:px-7">
        <div className="space-y-4">
          <Slider
            title="Focus Duration"
            min={5}
            max={90}
            step={5}
            value={draft.focusMinutes}
            showValueBadge
            unit=" min"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                focusMinutes: Number(e.target.value),
              }))
            }
            ariaLabel="Focus session length in minutes"
          />

          <Slider
            title="Short Break"
            min={1}
            max={30}
            step={1}
            value={draft.shortBreakMinutes}
            showValueBadge
            unit=" min"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                shortBreakMinutes: Number(e.target.value),
              }))
            }
            ariaLabel="Short break length in minutes"
          />

          <Slider
            title="Long Break"
            min={5}
            max={45}
            step={5}
            value={draft.longBreakMinutes}
            showValueBadge
            unit=" min"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                longBreakMinutes: Number(e.target.value),
              }))
            }
            ariaLabel="Long break length in minutes"
          />

          <Slider
            title="Sessions Before Long Break"
            min={2}
            max={8}
            step={1}
            value={draft.sessionsBeforeLongBreak}
            showValueBadge
            unit="x"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                sessionsBeforeLongBreak: Number(e.target.value),
              }))
            }
            ariaLabel="Number of focus sessions before long break"
          />
        </div>

        <div className="space-y-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Auto-start Breaks
            </span>
            <Switch
              size="sm"
              checked={draft.autoStartBreaks}
              onChange={(autoStartBreaks) =>
                setDraft((prev) => ({ ...prev, autoStartBreaks }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Auto-start Focus Sessions
            </span>
            <Switch
              size="sm"
              checked={draft.autoStartFocus}
              onChange={(autoStartFocus) =>
                setDraft((prev) => ({ ...prev, autoStartFocus }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              Completion Bell Chime
            </span>
            <Switch
              size="sm"
              checked={draft.enableChime}
              onChange={(enableChime) =>
                setDraft((prev) => ({ ...prev, enableChime }))
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/70 pt-4 dark:border-neutral-800/70">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetDefaults}
          >
            Defaults
          </Button>
          <Button variant="primary" size="sm" rounded="xl" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </ConfigDialog>
  );
}
