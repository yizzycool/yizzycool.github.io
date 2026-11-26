'use client';

import type { TimezoneMode } from './constants';

import { CalendarDays, RefreshCw } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs } from '@/components/ui/tabs';
import useIsClient from '@/hooks/lifecycle/use-is-client';

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
  const isClient = useIsClient();
  const quickOffsets = QUICK_OFFSETS.slice(0, 4);

  return (
    <div className="w-full text-left">
      <LabelBar
        label="Human Date to Unix Timestamp"
        icon={CalendarDays}
        htmlFor="datetime-local-input"
        description="Select date & time via the calendar picker or paste any datetime string"
      >
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
        <PasteAction onClick={onPasteDateString} />
        <DeleteAction onClick={onClear} />
      </LabelBar>

      <div className="space-y-3">
        {/* Timezone Mode Selector & Quick Offsets */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Interpreted As:
            </span>
            <Tabs
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

        {/* Date & Time Picker */}
        <DatePicker
          id="datetime-local-input"
          showTime
          showSeconds
          size="base"
          value={dateTimeString}
          onChange={onDateTimeChange}
        />

        {/* Dual Results Output: Seconds & Milliseconds */}
        <div className="divide-y divide-neutral-200/70 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
          <PropertyRow
            label="Timestamp in Seconds"
            badge="10 digits"
            value={
              isClient && convertedResult.isValid
                ? convertedResult.seconds
                : undefined
            }
            displayValue={
              isClient
                ? convertedResult.isValid
                  ? convertedResult.seconds
                  : 'Invalid date/time components'
                : '---'
            }
            grouped
          />
          <PropertyRow
            label="Timestamp in Milliseconds"
            badge="13 digits"
            value={
              isClient && convertedResult.isValid
                ? convertedResult.milliseconds
                : undefined
            }
            displayValue={
              isClient
                ? convertedResult.isValid
                  ? convertedResult.milliseconds
                  : 'Invalid date/time components'
                : '---'
            }
            grouped
          />
        </div>
      </div>
    </div>
  );
}
