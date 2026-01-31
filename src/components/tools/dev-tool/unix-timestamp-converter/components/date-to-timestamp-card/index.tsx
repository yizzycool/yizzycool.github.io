'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Card from '@/components/common/card';
import DateInput from './components/date-input';
import CopyAction from '@/components/common/action-button/copy';
import CardTitle from '@/components/common/card/title';

import _isNumber from 'lodash/isNumber';

type DateInput = {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  timezone?: string;
};

export default function DateToTimestampCard() {
  const [dateInput, setDateInput] = useState<DateInput>({});

  useEffect(() => {
    const date = new Date();
    setDateInput({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      timezone: 'UTC',
    });
  }, []);

  // Date to Timestamp Calculation
  const convertedTimestamp = useMemo(() => {
    try {
      const { year, month, day, hour, minute, second } = dateInput;
      if (!_isNumber(year) || !_isNumber(month)) return;
      const date = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
      );
      return Math.floor(date.getTime() / 1000);
    } catch (_e) {
      return;
    }
  }, [dateInput]);

  const updateDateInput = (field: string, value: string) => {
    setDateInput((prev) => ({
      ...prev,
      [field]: !!value ? parseInt(value) : '',
    }));
  };

  return (
    <Card animation="fade-in" className="text-left">
      <CardTitle icon={CalendarDays}>UTC Date to Timestamp</CardTitle>

      {/* Separate */}
      <div className="-mx-6 my-6 border-b border-neutral-200 dark:border-neutral-700" />

      <div className="flex-1">
        <div className="grid grid-cols-3 gap-3">
          <DateInput
            label="Year"
            value={dateInput?.year}
            onChange={(v) => updateDateInput('year', v)}
          />
          <DateInput
            label="Month"
            value={dateInput?.month}
            min={1}
            max={12}
            onChange={(v) => updateDateInput('month', v)}
          />
          <DateInput
            label="Day"
            value={dateInput?.day}
            min={1}
            max={31}
            onChange={(v) => updateDateInput('day', v)}
          />
          <DateInput
            label="Hour"
            value={dateInput?.hour}
            min={0}
            max={23}
            onChange={(v) => updateDateInput('hour', v)}
          />
          <DateInput
            label="Min"
            value={dateInput?.minute}
            min={0}
            max={59}
            onChange={(v) => updateDateInput('minute', v)}
          />
          <DateInput
            label="Sec"
            value={dateInput?.second}
            min={0}
            max={59}
            onChange={(v) => updateDateInput('second', v)}
          />
        </div>

        <div className="mt-8 rounded-xl bg-neutral-100 p-6 dark:bg-neutral-800/50">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Resulting Timestamp
          </p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-bold">
              {convertedTimestamp ?? '---'}
            </span>
            <CopyAction
              display="icon"
              content={convertedTimestamp?.toString() || ''}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
