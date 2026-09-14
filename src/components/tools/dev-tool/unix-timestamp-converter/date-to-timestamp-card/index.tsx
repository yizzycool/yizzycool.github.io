'use client';

import type { DateFields } from '../hooks/use-unix-timestamp-converter';
import type { TimezoneMode } from '../constants';

import { CalendarDays, RefreshCw } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DeleteAction } from '@/components/shared/action-button';

import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';

import { TIMEZONE_MODES, TIMEZONE_MODE_LABELS } from '../constants';
import DateInput from './date-input';

type Props = {
  dateFields: DateFields;
  timezoneMode: TimezoneMode;
  setTimezoneMode: (mode: TimezoneMode) => void;
  convertedResult: {
    isValid: boolean;
    seconds: number;
    milliseconds: number;
  };
  onUpdateField: (field: keyof DateFields, value: string) => void;
  onSetToNow: () => void;
  onClear: () => void;
};

export default function DateToTimestampCard({
  dateFields,
  timezoneMode,
  setTimezoneMode,
  convertedResult,
  onUpdateField,
  onSetToNow,
  onClear,
}: Props) {
  return (
    <Card animation="fade-in" className="text-left">
      <CardTitle icon={CalendarDays}>Date to Unix Timestamp</CardTitle>

      {/* Separator */}
      <Separator className="-mx-6 my-6" />

      <div className="space-y-6">
        {/* LabelBar with Actions */}
        <LabelBar
          label="Enter Date & Time Components"
          icon={CalendarDays}
          htmlFor="date-inputs-container"
        >
          <Button
            variant="surface"
            bordered
            size="xs"
            rounded="lg"
            icon={RefreshCw}
            onClick={onSetToNow}
          >
            Now
          </Button>
          <DeleteAction onClick={onClear} />
        </LabelBar>

        {/* Timezone Mode Selector */}
        <div className="flex items-center gap-2 text-xs">
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

        {/* 6-Field Date/Time Input Grid */}
        <div
          id="date-inputs-container"
          className="grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          <DateInput
            label="Year"
            value={dateFields.year}
            onChange={(v) => onUpdateField('year', v)}
          />
          <DateInput
            label="Month"
            value={dateFields.month}
            min={1}
            max={12}
            onChange={(v) => onUpdateField('month', v)}
          />
          <DateInput
            label="Day"
            value={dateFields.day}
            min={1}
            max={31}
            onChange={(v) => onUpdateField('day', v)}
          />
          <DateInput
            label="Hour"
            value={dateFields.hour}
            min={0}
            max={23}
            onChange={(v) => onUpdateField('hour', v)}
          />
          <DateInput
            label="Min"
            value={dateFields.minute}
            min={0}
            max={59}
            onChange={(v) => onUpdateField('minute', v)}
          />
          <DateInput
            label="Sec"
            value={dateFields.second}
            min={0}
            max={59}
            onChange={(v) => onUpdateField('second', v)}
          />
        </div>

        {/* Dual Results Output: Seconds & Milliseconds */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PropertyRow
            label="Timestamp in Seconds"
            badge="10 digits"
            value={
              convertedResult.isValid ? convertedResult.seconds : undefined
            }
          />
          <PropertyRow
            label="Timestamp in Milliseconds"
            badge="13 digits"
            value={
              convertedResult.isValid ? convertedResult.milliseconds : undefined
            }
          />
        </div>
      </div>
    </Card>
  );
}
