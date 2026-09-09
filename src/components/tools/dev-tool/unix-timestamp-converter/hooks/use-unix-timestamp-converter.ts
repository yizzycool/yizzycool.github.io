'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { WORLD_TIMEZONES } from '../constants';

export type UnixTimestampHistoryData = {
  type: 'timestamp-to-date' | 'date-to-timestamp';
  timestampSec: number;
  timestampMs: number;
  iso: string;
  local: string;
  utc: string;
  note?: string;
};

export type DateFields = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type ConvertedTimezoneItem = {
  id: string;
  name: string;
  city: string;
  timezone: string;
  utcOffsetHint: string;
  formatted: string;
};

export default function useUnixTimestampConverter() {
  // ----------------------------------------------------
  // Live Clock State
  // ----------------------------------------------------
  const [now, setNow] = useState<Date>(() => new Date());
  const [isClockPaused, setIsClockPaused] = useState(false);

  useEffect(() => {
    if (isClockPaused) return;

    const timer = setInterval(() => {
      setNow(new Date());
    }, 500);

    return () => clearInterval(timer);
  }, [isClockPaused]);

  const toggleClockPause = useCallback(() => {
    setIsClockPaused((prev) => {
      if (prev) {
        setNow(new Date());
        toast.info('Live clock resumed');
      } else {
        toast.info('Live clock paused');
      }
      return !prev;
    });
  }, []);

  const deviceTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local';
    }
  }, []);

  // ----------------------------------------------------
  // 2. Timestamp -> Date State
  // ----------------------------------------------------
  const [tsInput, setTsInput] = useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [unitMode, setUnitMode] = useState<'auto' | 'seconds' | 'milliseconds'>(
    'auto'
  );
  const tsInputRef = useRef<HTMLInputElement>(null);

  // Parse and calculate Date from tsInput
  const parsedTimestampInfo = useMemo(() => {
    const trimmed = tsInput.trim();
    if (!trimmed) {
      return {
        isValid: false,
        date: null,
        unit: 'seconds' as const,
        seconds: 0,
        milliseconds: 0,
      };
    }

    const val = Number(trimmed);
    if (isNaN(val) || !isFinite(val)) {
      return {
        isValid: false,
        date: null,
        unit: 'seconds' as const,
        seconds: 0,
        milliseconds: 0,
      };
    }

    let isMs = false;
    if (unitMode === 'auto') {
      isMs = trimmed.length >= 12 || val > 9999999999;
    } else {
      isMs = unitMode === 'milliseconds';
    }

    const date = new Date(isMs ? val : val * 1000);
    const isValid = !isNaN(date.getTime());
    const seconds = isMs ? Math.floor(val / 1000) : Math.floor(val);
    const milliseconds = isMs ? Math.floor(val) : Math.floor(val * 1000);

    return {
      isValid,
      date: isValid ? date : null,
      unit: (isMs ? 'milliseconds' : 'seconds') as 'seconds' | 'milliseconds',
      seconds,
      milliseconds,
    };
  }, [tsInput, unitMode]);

  // Derived conversions for Timestamp -> Date
  const tsConvertedValues = useMemo(() => {
    const { date, isValid } = parsedTimestampInfo;
    if (!isValid || !date) {
      return {
        utc: '',
        local: '',
        iso: '',
        timezones: [] as ConvertedTimezoneItem[],
      };
    }

    const utc = date.toUTCString();
    const local = date.toLocaleString();
    let iso = '';
    try {
      iso = date.toISOString();
    } catch {
      iso = '';
    }

    const timezones: ConvertedTimezoneItem[] = WORLD_TIMEZONES.map((tz) => {
      let formatted = '';
      try {
        formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: tz.timezone,
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(date);
      } catch {
        formatted = date.toUTCString();
      }
      return {
        ...tz,
        formatted,
      };
    });

    return {
      utc,
      local,
      iso,
      timezones,
    };
  }, [parsedTimestampInfo]);

  // Apply quick offset (+1h, +1d, etc.)
  const applyOffset = useCallback(
    (offsetSeconds: number) => {
      const { seconds, unit, isValid } = parsedTimestampInfo;
      const baseSec = isValid ? seconds : Math.floor(Date.now() / 1000);
      const newSec = baseSec + offsetSeconds;

      if (unit === 'milliseconds') {
        setTsInput((newSec * 1000).toString());
      } else {
        setTsInput(newSec.toString());
      }
      toast.success(
        `${offsetSeconds > 0 ? '+' : ''}${offsetSeconds / 3600 >= 1 ? `${offsetSeconds / 3600}h` : `${offsetSeconds}s`} applied`
      );
    },
    [parsedTimestampInfo]
  );

  const setTsInputToNow = useCallback(() => {
    const current = Math.floor(Date.now() / 1000);
    setTsInput(current.toString());
    setUnitMode('seconds');
    toast.success('Timestamp set to current device time');
  }, []);

  const onPasteTsInput = useCallback((text: string) => {
    const clean = text.replace(/[^0-9-]/g, '');
    setTsInput(clean);
  }, []);

  const onClearTsInput = useCallback(() => {
    setTsInput('');
  }, []);

  // ----------------------------------------------------
  // 3. Date -> Timestamp State
  // ----------------------------------------------------
  const [dateFields, setDateFields] = useState<DateFields>(() => {
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
    };
  });
  const [dateTzMode, setDateTzMode] = useState<'local' | 'utc'>('local');

  const convertedFromDate = useMemo(() => {
    const { year, month, day, hour, minute, second } = dateFields;
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return { isValid: false, seconds: 0, milliseconds: 0, dateObj: null };
    }

    try {
      let d: Date;
      if (dateTzMode === 'utc') {
        d = new Date(
          Date.UTC(
            year,
            (month || 1) - 1,
            day || 1,
            hour || 0,
            minute || 0,
            second || 0
          )
        );
      } else {
        d = new Date(
          year,
          (month || 1) - 1,
          day || 1,
          hour || 0,
          minute || 0,
          second || 0
        );
      }

      if (isNaN(d.getTime())) {
        return { isValid: false, seconds: 0, milliseconds: 0, dateObj: null };
      }

      return {
        isValid: true,
        seconds: Math.floor(d.getTime() / 1000),
        milliseconds: d.getTime(),
        dateObj: d,
      };
    } catch {
      return { isValid: false, seconds: 0, milliseconds: 0, dateObj: null };
    }
  }, [dateFields, dateTzMode]);

  const updateDateField = useCallback(
    (field: keyof DateFields, value: string) => {
      const numVal = parseInt(value, 10);
      setDateFields((prev) => ({
        ...prev,
        [field]: isNaN(numVal) ? ('' as unknown as number) : numVal,
      }));
    },
    []
  );

  const setDateToNow = useCallback(() => {
    const d = new Date();
    setDateFields({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
    });
    toast.success('Date inputs reset to current time');
  }, []);

  const onClearDateInput = useCallback(() => {
    setDateFields({
      year: 0,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });
  }, []);

  // ----------------------------------------------------
  // 4. History Storage Integration
  // ----------------------------------------------------
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<UnixTimestampHistoryData>('unix-timestamp-converter');

  const saveToHistory = useCallback(
    (customType?: 'timestamp-to-date' | 'date-to-timestamp') => {
      const isDateSource = customType === 'date-to-timestamp';

      if (isDateSource) {
        if (!convertedFromDate.isValid || !convertedFromDate.dateObj) {
          toast.error('Invalid date to save');
          return;
        }

        const d = convertedFromDate.dateObj;
        const title = `${convertedFromDate.seconds} (${d.toLocaleDateString()})`;
        addHistory(title, {
          type: 'date-to-timestamp',
          timestampSec: convertedFromDate.seconds,
          timestampMs: convertedFromDate.milliseconds,
          iso: d.toISOString(),
          local: d.toLocaleString(),
          utc: d.toUTCString(),
        });
        toast.success('Saved date conversion to history!');
        return;
      }

      // Default: save timestamp conversion
      const { isValid, date, seconds, milliseconds } = parsedTimestampInfo;
      if (!isValid || !date) {
        toast.error('Invalid timestamp to save');
        return;
      }

      const title = `${seconds} ➔ ${date.toLocaleDateString()}`;
      addHistory(title, {
        type: 'timestamp-to-date',
        timestampSec: seconds,
        timestampMs: milliseconds,
        iso: tsConvertedValues.iso,
        local: tsConvertedValues.local,
        utc: tsConvertedValues.utc,
      });
      toast.success('Saved timestamp conversion to history!');
    },
    [addHistory, convertedFromDate, parsedTimestampInfo, tsConvertedValues]
  );

  const onRestoreHistory = useCallback((item: UnixTimestampHistoryData) => {
    if (item.timestampSec) {
      setTsInput(item.timestampSec.toString());
      setUnitMode('seconds');

      // Also sync Date inputs
      const d = new Date(item.timestampSec * 1000);
      if (!isNaN(d.getTime())) {
        setDateFields({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          hour: d.getHours(),
          minute: d.getMinutes(),
          second: d.getSeconds(),
        });
      }

      toast.success(`Restored timestamp: ${item.timestampSec}`);
    }
  }, []);

  // Copy primary result
  const onCopyPrimary = useCallback(async () => {
    try {
      if (parsedTimestampInfo.isValid && tsConvertedValues.iso) {
        await navigator.clipboard.writeText(tsConvertedValues.iso);
        toast.success('Copied ISO 8601 result!');
      } else if (convertedFromDate.isValid) {
        await navigator.clipboard.writeText(
          convertedFromDate.seconds.toString()
        );
        toast.success('Copied Unix Timestamp (s)!');
      }
    } catch {
      toast.error('Failed to copy');
    }
  }, [parsedTimestampInfo, tsConvertedValues, convertedFromDate]);

  // Global paste
  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onPasteTsInput(text);
        if (tsInputRef.current) {
          tsInputRef.current.focus();
        }
        toast.success('Pasted into timestamp input!');
      }
    } catch {
      toast.error('Failed to paste from clipboard');
    }
  }, [onPasteTsInput]);

  // ----------------------------------------------------
  // 5. Hotkeys Listener
  // ----------------------------------------------------
  useToolHotkeys(
    {
      onExecute: () => saveToHistory(),
      onClear: onClearTsInput,
      onPaste: onGlobalPaste,
      onCopy: onCopyPrimary,
    },
    { target: tsInputRef }
  );

  return {
    // Live clock
    now,
    isClockPaused,
    toggleClockPause,
    deviceTimezone,

    // Timestamp -> Date
    tsInput,
    setTsInput,
    unitMode,
    setUnitMode,
    tsInputRef,
    parsedTimestampInfo,
    tsConvertedValues,
    applyOffset,
    setTsInputToNow,
    onPasteTsInput,
    onClearTsInput,

    // Date -> Timestamp
    dateFields,
    dateTzMode,
    setDateTzMode,
    convertedFromDate,
    updateDateField,
    setDateToNow,
    onClearDateInput,

    // History
    historyList,
    isLoadingHistory,
    saveToHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  };
}
