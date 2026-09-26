'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { WORLD_TIMEZONES } from '../constants';

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

function padZero(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

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
  const [dateTimeString, setDateTimeString] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}T${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;
  });
  const [dateTzMode, setDateTzMode] = useState<'local' | 'utc'>('local');

  const parseFlexibleDateTime = useCallback(
    (str: string): DateFields | null => {
      const trimmed = str.trim();
      if (!trimmed) return null;

      // 1. Match YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
      const isoLocal = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
      );
      if (isoLocal) {
        return {
          year: parseInt(isoLocal[1], 10),
          month: parseInt(isoLocal[2], 10),
          day: parseInt(isoLocal[3], 10),
          hour: parseInt(isoLocal[4], 10),
          minute: parseInt(isoLocal[5], 10),
          second: isoLocal[6] ? parseInt(isoLocal[6], 10) : 0,
        };
      }

      // 2. Match YYYY-MM-DD HH:mm:ss or YYYY/MM/DD HH:mm:ss
      const common = trimmed.match(
        /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
      );
      if (common) {
        return {
          year: parseInt(common[1], 10),
          month: parseInt(common[2], 10),
          day: parseInt(common[3], 10),
          hour: common[4] ? parseInt(common[4], 10) : 0,
          minute: common[5] ? parseInt(common[5], 10) : 0,
          second: common[6] ? parseInt(common[6], 10) : 0,
        };
      }

      // 3. Fallback to native Date parsing
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return {
          year: parsed.getFullYear(),
          month: parsed.getMonth() + 1,
          day: parsed.getDate(),
          hour: parsed.getHours(),
          minute: parsed.getMinutes(),
          second: parsed.getSeconds(),
        };
      }

      return null;
    },
    []
  );

  const convertedFromDate = useMemo(() => {
    const parsed = parseFlexibleDateTime(dateTimeString);
    if (!parsed || !parsed.year || isNaN(parsed.year) || parsed.year <= 0) {
      return { isValid: false, seconds: 0, milliseconds: 0, dateObj: null };
    }

    const { year, month, day, hour, minute, second } = parsed;
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
  }, [dateTimeString, dateTzMode, parseFlexibleDateTime]);

  const onDateTimeChange = useCallback((val: string) => {
    setDateTimeString(val);
  }, []);

  const setDateToNow = useCallback(() => {
    const d = new Date();
    if (dateTzMode === 'utc') {
      setDateTimeString(
        `${d.getUTCFullYear()}-${padZero(d.getUTCMonth() + 1)}-${padZero(d.getUTCDate())}T${padZero(d.getUTCHours())}:${padZero(d.getUTCMinutes())}:${padZero(d.getUTCSeconds())}`
      );
    } else {
      setDateTimeString(
        `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}T${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`
      );
    }
    toast.success('Date & time set to current time');
  }, [dateTzMode]);

  const onClearDateInput = useCallback(() => {
    setDateTimeString('');
  }, []);

  const onApplyDateOffset = useCallback(
    (offsetSeconds: number) => {
      const baseMs = convertedFromDate.isValid
        ? convertedFromDate.milliseconds
        : Date.now();
      const targetDate = new Date(baseMs + offsetSeconds * 1000);

      if (dateTzMode === 'utc') {
        setDateTimeString(
          `${targetDate.getUTCFullYear()}-${padZero(targetDate.getUTCMonth() + 1)}-${padZero(targetDate.getUTCDate())}T${padZero(targetDate.getUTCHours())}:${padZero(targetDate.getUTCMinutes())}:${padZero(targetDate.getUTCSeconds())}`
        );
      } else {
        setDateTimeString(
          `${targetDate.getFullYear()}-${padZero(targetDate.getMonth() + 1)}-${padZero(targetDate.getDate())}T${padZero(targetDate.getHours())}:${padZero(targetDate.getMinutes())}:${padZero(targetDate.getSeconds())}`
        );
      }
      const abs = Math.abs(offsetSeconds);
      const label =
        abs >= 86400 ? `${offsetSeconds / 86400}d` : `${offsetSeconds / 3600}h`;
      toast.success(`${offsetSeconds > 0 ? '+' : ''}${label} applied`);
    },
    [convertedFromDate, dateTzMode]
  );

  const onPasteDateString = useCallback(
    (text: string) => {
      const parsed = parseFlexibleDateTime(text);
      if (parsed) {
        setDateTimeString(
          `${padZero(parsed.year, 4)}-${padZero(parsed.month)}-${padZero(parsed.day)}T${padZero(parsed.hour)}:${padZero(parsed.minute)}:${padZero(parsed.second)}`
        );
        toast.success('Pasted and parsed datetime string');
      } else {
        toast.error('Unable to parse date string format');
      }
    },
    [parseFlexibleDateTime]
  );

  const dateFields = useMemo<DateFields>(() => {
    const parsed = parseFlexibleDateTime(dateTimeString);
    if (!parsed) {
      return { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
    }
    return parsed;
  }, [dateTimeString, parseFlexibleDateTime]);

  // ----------------------------------------------------
  // 4. Cleanup Residual History on Mount
  // ----------------------------------------------------
  const { deleteValue } = useToolsDB();

  useEffect(() => {
    deleteValue('history', 'unix-timestamp-converter').catch(() => {});
  }, [deleteValue]);

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
      onClear: onClearTsInput,
      onPaste: onGlobalPaste,
      onCopy: onCopyPrimary,
    },
    { target: tsInputRef }
  );

  const updateDateField = useCallback(
    (field: keyof DateFields, value: string) => {
      const numVal = parseInt(value, 10);
      const parsed = parseFlexibleDateTime(dateTimeString) || {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        second: new Date().getSeconds(),
      };
      const updated = {
        ...parsed,
        [field]: isNaN(numVal) ? 0 : numVal,
      };
      setDateTimeString(
        `${padZero(updated.year, 4)}-${padZero(updated.month)}-${padZero(updated.day)}T${padZero(updated.hour)}:${padZero(updated.minute)}:${padZero(updated.second)}`
      );
    },
    [dateTimeString, parseFlexibleDateTime]
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
    dateTimeString,
    dateFields,
    dateTzMode,
    setDateTzMode,
    convertedFromDate,
    onDateTimeChange,
    onApplyDateOffset,
    onPasteDateString,
    updateDateField,
    setDateToNow,
    onClearDateInput,
  };
}
