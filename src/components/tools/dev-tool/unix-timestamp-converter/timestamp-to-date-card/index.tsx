'use client';

import type { ConvertedTimezoneItem } from '../hooks/use-unix-timestamp-converter';

import { useState } from 'react';
import { Hash, RefreshCw, Globe, ChevronDown, ChevronUp } from 'lucide-react';

import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PillTabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PasteAction, DeleteAction } from '@/components/shared/action-button';

import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';

import { QUICK_OFFSETS, UNIT_MODES, UNIT_MODE_LABELS } from '../constants';

type Props = {
  tsInput: string;
  setTsInput: (val: string) => void;
  unitMode: 'auto' | 'seconds' | 'milliseconds';
  setUnitMode: (mode: 'auto' | 'seconds' | 'milliseconds') => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  parsedInfo: {
    isValid: boolean;
    date: Date | null;
    unit: 'seconds' | 'milliseconds';
    seconds: number;
    milliseconds: number;
  };
  convertedValues: {
    utc: string;
    local: string;
    iso: string;
    timezones: ConvertedTimezoneItem[];
  };
  onSetToNow: () => void;
  onApplyOffset: (seconds: number) => void;
  onPaste: (text: string) => void;
  onClear: () => void;
};

export default function TimestampToDateCard({
  tsInput,
  setTsInput,
  unitMode,
  setUnitMode,
  inputRef,
  parsedInfo,
  convertedValues,
  onSetToNow,
  onApplyOffset,
  onPaste,
  onClear,
}: Props) {
  const [showAllTimezones, setShowAllTimezones] = useState(false);

  return (
    <Card animation="fade-in" className="text-left">
      <CardTitle icon={Hash}>Timestamp to Date</CardTitle>

      {/* Separator */}
      <Separator className="-mx-6 my-6" />

      <div className="space-y-6">
        {/* LabelBar with Paste, Clear */}
        <LabelBar
          label="Enter Unix Timestamp"
          icon={Hash}
          htmlFor="timestamp-input"
        >
          <PasteAction onClick={onPaste} />
          <DeleteAction onClick={onClear} disabled={!tsInput} />
        </LabelBar>

        {/* Input Box with Unit Badge & Now button */}
        <div className="space-y-4">
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              id="timestamp-input"
              inputMode="numeric"
              value={tsInput}
              onChange={(e) =>
                setTsInput(e.target.value.replace(/[^0-9-]/g, ''))
              }
              className="py-3.5 pr-24 font-mono text-lg"
              placeholder="e.g. 1734771000 or 1734771000000"
            />

            <div className="absolute right-2.5 z-10 flex items-center gap-1">
              <Button
                variant="surface"
                bordered
                size="xs"
                rounded="lg"
                icon={RefreshCw}
                onClick={onSetToNow}
                title="Set to current device time"
              >
                Now
              </Button>
            </div>
          </div>

          {/* Unit Detection & Selector Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Unit:</span>
            <PillTabs
              tabs={UNIT_MODES}
              activeTab={unitMode}
              onChange={setUnitMode}
              tabLabels={UNIT_MODE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2 py-1"
            />

            {parsedInfo.isValid && (
              <Badge variant="blue" size="xs" rounded="full">
                {parsedInfo.unit === 'seconds'
                  ? '10 digits (s)'
                  : '13 digits (ms)'}
              </Badge>
            )}
          </div>

          {/* Quick Offset Adjustments (+1h, +1d, etc.) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">
              Offset:
            </span>
            {QUICK_OFFSETS.map((offset) => (
              <Button
                key={offset.label}
                bordered
                variant="surface"
                size="xs"
                rounded="md"
                onClick={() => onApplyOffset(offset.seconds)}
                className="font-mono text-xs"
              >
                {offset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Primary Results Display */}
        <div className="space-y-3 pt-2">
          <PropertyRow
            label="GMT / UTC"
            value={convertedValues.utc}
            badge="UTC+0"
          />
          <PropertyRow
            label="Local Time"
            value={convertedValues.local}
            badge="Device Local"
          />
          <PropertyRow
            label="ISO 8601"
            value={convertedValues.iso}
            badge="Standard"
          />
        </div>

        {/* Major World Timezones Section */}
        {convertedValues.timezones.length > 0 && (
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-700/80 dark:bg-neutral-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  World Timezones Comparison
                </h3>
              </div>
              <Button
                variant="ghost"
                size="xs"
                rounded="md"
                icon={showAllTimezones ? ChevronUp : ChevronDown}
                onClick={() => setShowAllTimezones((prev) => !prev)}
              >
                {showAllTimezones ? 'Collapse' : 'Expand All (7)'}
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(showAllTimezones
                ? convertedValues.timezones
                : convertedValues.timezones.slice(0, 4)
              ).map((tz) => (
                <PropertyRow
                  key={tz.id}
                  label={`${tz.name} (${tz.utcOffsetHint})`}
                  value={tz.formatted}
                  className="bg-white dark:bg-neutral-800/60"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
