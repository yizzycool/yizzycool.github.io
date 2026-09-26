'use client';

import type { TimezoneMode } from './constants';

import { CalendarDays, RefreshCw } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import {
  QUICK_OFFSETS,
  TIMEZONE_MODES,
  TIMEZONE_MODE_LABELS,
} from './constants';

type Props = {
  dateTimeString: string;
  timezoneMode: TimezoneMode;
  setTimezoneMode: (mode: TimezoneMode) => void;
  convertedResult: {
    isValid: boolean;
    seconds: number;
    milliseconds: number;
  };
  onDateTimeChange: (val: string) => void;
  onApplyOffset: (seconds: number) => void;
  onPasteDateString: (text: string) => void;
  onSetToNow: () => void;
  onClear: () => void;
};

export default function DateToTimestampSection({
  dateTimeString,
  timezoneMode,
  setTimezoneMode,
  convertedResult,
  onDateTimeChange,
  onApplyOffset,
  onPasteDateString,
  onSetToNow,
  onClear,
}: Props) {
  const quickOffsets = QUICK_OFFSETS.slice(0, 4);

  return (
    <div className="w-full text-left">
      <LabelBar
        label="Human Date to Unix Timestamp"
        icon={CalendarDays}
        htmlFor="datetime-local-input"
        description="Select date & time via native calendar or paste custom datetime string"
      >
        <PasteAction onClick={onPasteDateString} />
        <Button
          variant="surface"
          bordered
          size="xs"
          rounded="lg"
          icon={RefreshCw}
          onClick={onSetToNow}
          title="Set date to current device time"
        >
          Now
        </Button>
        <DeleteAction onClick={onClear} />
      </LabelBar>

      <div className="space-y-3">
        {/* Timezone Mode Selector & Quick Offsets */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Interpreted As:
            </span>
            <PillTabs
              tabs={TIMEZONE_MODES}
              activeTab={timezoneMode}
              onChange={setTimezoneMode}
              tabLabels={TIMEZONE_MODE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2.5 py-1 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500">Offset:</span>
            {quickOffsets.map((offset) => (
              <Button
                key={offset.label}
                variant="surface"
                size="xs"
                rounded="md"
                className="px-2 py-0.5 font-mono text-xs"
                onClick={() => onApplyOffset(offset.seconds)}
              >
                {offset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Native Datetime-Local Picker Input */}
        <div className="relative w-full">
          <input
            id="datetime-local-input"
            type="datetime-local"
            step="1"
            value={dateTimeString}
            onChange={(e) => onDateTimeChange(e.target.value)}
            className={cn(
              'w-full rounded-xl border border-neutral-200/90 px-4 py-2.5 font-mono text-sm outline-none transition-all sm:text-base',
              'bg-white/70 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/60 dark:text-neutral-100',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
              '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100'
            )}
          />
        </div>

        {/* Dual Results Output: Seconds & Milliseconds */}
        <div className="divide-y divide-neutral-200/70 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
          <PropertyRow
            label="Timestamp in Seconds"
            badge="10 digits"
            value={
              convertedResult.isValid ? convertedResult.seconds : undefined
            }
            displayValue={
              convertedResult.isValid
                ? convertedResult.seconds
                : 'Invalid date/time components'
            }
            grouped
          />
          <PropertyRow
            label="Timestamp in Milliseconds"
            badge="13 digits"
            value={
              convertedResult.isValid ? convertedResult.milliseconds : undefined
            }
            displayValue={
              convertedResult.isValid
                ? convertedResult.milliseconds
                : 'Invalid date/time components'
            }
            grouped
          />
        </div>
      </div>
    </div>
  );
}
