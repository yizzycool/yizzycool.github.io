'use client';

import type { ChevronProps } from 'react-day-picker';
import type { DatePickerProps } from './types';

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { DEFAULT_MAX_YEAR, DEFAULT_MIN_YEAR } from './constants';
import {
  datePickerDayPickerClassNames,
  datePickerPopoverStyles,
  datePickerTimeInputStyles,
  datePickerTriggerSizes,
  datePickerTriggerStyles,
} from './date-picker.variants';

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function parseDateValue(
  raw: string,
  showTime: boolean
): {
  date: Date | undefined;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { date: undefined, hours: 0, minutes: 0, seconds: 0 };
  }

  const [datePart, timePart = ''] = trimmed.split('T');
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!dateMatch) {
    return { date: undefined, hours: 0, minutes: 0, seconds: 0 };
  }

  const year = Number(dateMatch[1]);
  const monthIdx = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);
  const parsed = new Date(year, monthIdx, day, 0, 0, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIdx ||
    parsed.getDate() !== day
  ) {
    return { date: undefined, hours: 0, minutes: 0, seconds: 0 };
  }

  if (!showTime || !timePart) {
    return { date: parsed, hours: 0, minutes: 0, seconds: 0 };
  }

  const [hStr = '0', mStr = '0', sStr = '0'] = timePart.split(':');
  const hours = Math.min(23, Math.max(0, Number.parseInt(hStr, 10) || 0));
  const minutes = Math.min(59, Math.max(0, Number.parseInt(mStr, 10) || 0));
  const seconds = Math.min(59, Math.max(0, Number.parseInt(sStr, 10) || 0));

  return { date: parsed, hours, minutes, seconds };
}

function formatPickerOutput(params: {
  date: Date;
  showTime: boolean;
  showSeconds: boolean;
  hours: number;
  minutes: number;
  seconds: number;
}): string {
  const { date, showTime, showSeconds, hours, minutes, seconds } = params;
  const dateStr = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  if (!showTime) return dateStr;
  return showSeconds
    ? `${dateStr}T${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
    : `${dateStr}T${pad2(hours)}:${pad2(minutes)}`;
}

function CalendarChevron({ orientation, className }: ChevronProps) {
  if (orientation === 'left') {
    return <ChevronLeft size={14} className={className} />;
  }
  if (orientation === 'right') {
    return <ChevronRight size={14} className={className} />;
  }
  return <ChevronDown size={12} className={cn('opacity-70', className)} />;
}

const DAY_PICKER_COMPONENTS = {
  Chevron: CalendarChevron,
};

/**
 * Accessible frosted-glass Date & optional Time picker built on react-day-picker and Floating UI.
 */
export function DatePicker({
  value,
  onChange,
  showTime = false,
  showSeconds = false,
  id,
  placeholder,
  disabled = false,
  size = 'sm',
  minYear = DEFAULT_MIN_YEAR,
  maxYear = DEFAULT_MAX_YEAR,
  className,
}: DatePickerProps) {
  const parsed = parseDateValue(value, showTime);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(
    () => parsed.date ?? new Date(2026, 0, 1)
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setViewMonth(parsed.date ?? new Date());
    }
    setIsOpen(nextOpen);
  };

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) return;
    onChange(
      formatPickerOutput({
        date: day,
        showTime,
        showSeconds,
        hours: parsed.hours,
        minutes: parsed.minutes,
        seconds: parsed.seconds,
      })
    );
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimePartChange = (
    part: 'hours' | 'minutes' | 'seconds',
    rawVal: string
  ) => {
    const maxVal = part === 'hours' ? 23 : 59;
    const numeric = Math.min(
      maxVal,
      Math.max(0, Number.parseInt(rawVal, 10) || 0)
    );
    const baseDate = parsed.date ?? new Date();
    onChange(
      formatPickerOutput({
        date: baseDate,
        showTime: true,
        showSeconds,
        hours: part === 'hours' ? numeric : parsed.hours,
        minutes: part === 'minutes' ? numeric : parsed.minutes,
        seconds: part === 'seconds' ? numeric : parsed.seconds,
      })
    );
  };

  const handlePickNowOrToday = () => {
    const now = new Date();
    setViewMonth(now);
    onChange(
      formatPickerOutput({
        date: now,
        showTime,
        showSeconds,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      })
    );
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const displayLabel = parsed.date
    ? showTime
      ? `${parsed.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })} · ${pad2(parsed.hours)}:${pad2(parsed.minutes)}${showSeconds ? `:${pad2(parsed.seconds)}` : ''}`
      : parsed.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        })
    : placeholder || (showTime ? 'Select date & time' : 'Select date');

  return (
    <>
      <button
        ref={setReference}
        id={id}
        type="button"
        disabled={disabled}
        {...getReferenceProps()}
        className={cn(
          datePickerTriggerStyles,
          datePickerTriggerSizes[size],
          !parsed.date && 'text-slate-400 dark:text-slate-500',
          className
        )}
      >
        <span
          suppressHydrationWarning
          className="flex min-w-0 items-center gap-2 truncate"
        >
          <CalendarDays
            size={size === 'base' ? 16 : 14}
            className="shrink-0 text-sky-500 dark:text-sky-400"
          />
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={datePickerPopoverStyles}
            >
              <DayPicker
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(minYear, 0)}
                endMonth={new Date(maxYear, 11)}
                selected={parsed.date}
                month={viewMonth}
                onMonthChange={setViewMonth}
                onSelect={handleSelectDay}
                showOutsideDays
                classNames={datePickerDayPickerClassNames}
                components={DAY_PICKER_COMPONENTS}
              />

              {/* Footer: Time Inputs (when showTime) or Today shortcut */}
              <div className="mt-3 border-t border-neutral-200/80 pt-3 dark:border-neutral-800">
                {showTime ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                        <Clock size={12} className="text-sky-500" />
                        <span>Time</span>
                      </span>

                      <div className="flex items-center gap-1 font-mono text-xs text-neutral-500">
                        <input
                          type="number"
                          min={0}
                          max={23}
                          aria-label="Hours"
                          value={pad2(parsed.hours)}
                          onChange={(e) =>
                            handleTimePartChange('hours', e.target.value)
                          }
                          className={datePickerTimeInputStyles}
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          aria-label="Minutes"
                          value={pad2(parsed.minutes)}
                          onChange={(e) =>
                            handleTimePartChange('minutes', e.target.value)
                          }
                          className={datePickerTimeInputStyles}
                        />
                        {showSeconds && (
                          <>
                            <span>:</span>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              aria-label="Seconds"
                              value={pad2(parsed.seconds)}
                              onChange={(e) =>
                                handleTimePartChange('seconds', e.target.value)
                              }
                              className={datePickerTimeInputStyles}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        rounded="lg"
                        onClick={handlePickNowOrToday}
                      >
                        Now
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        rounded="lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      rounded="lg"
                      onClick={handlePickNowOrToday}
                    >
                      Today
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      rounded="lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
