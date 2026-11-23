'use client';

import { Globe } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import useIsClient from '@/hooks/lifecycle/use-is-client';

type Props = {
  now: Date;
  deviceTimezone: string;
};

type ClockZone = {
  id: string;
  label: string;
  timezone: string;
  hint: string;
};

function formatClockZone(
  date: Date,
  timezone: string
): { time: string; dateLabel: string; isoCopy: string } {
  try {
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    const dateLabel = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);

    const full = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    return { time, dateLabel, isoCopy: full };
  } catch {
    return {
      time: date.toUTCString().slice(17, 25),
      dateLabel: date.toUTCString().slice(0, 16),
      isoCopy: date.toISOString(),
    };
  }
}

export default function WorldClockStrip({ now, deviceTimezone }: Props) {
  const isClient = useIsClient();

  const zones: ClockZone[] = [
    { id: 'utc', label: 'UTC / GMT', timezone: 'UTC', hint: 'UTC+0' },
    {
      id: 'local',
      label: 'Local Device',
      timezone: deviceTimezone === 'Detecting...' ? 'UTC' : deviceTimezone,
      hint: 'Local',
    },
    { id: 'tokyo', label: 'Tokyo', timezone: 'Asia/Tokyo', hint: 'JST' },
    {
      id: 'new_york',
      label: 'New York',
      timezone: 'America/New_York',
      hint: 'ET',
    },
    {
      id: 'london',
      label: 'London',
      timezone: 'Europe/London',
      hint: 'GMT/BST',
    },
  ];

  return (
    <div className="w-full text-left">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-sky-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Live World Clock Strip
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {zones.map((zone) => {
          const formatted = isClient
            ? formatClockZone(now, zone.timezone)
            : { time: '--:--:--', dateLabel: '---', isoCopy: '' };

          return (
            <div
              key={zone.id}
              className="group flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white/70 p-3.5 backdrop-blur-md transition-colors hover:border-sky-300/80 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-sky-700/70"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {zone.label}
                </span>
                <Badge
                  size="xs"
                  rounded="base"
                  className="shrink-0 text-[10px]"
                >
                  {zone.hint}
                </Badge>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <div
                    suppressHydrationWarning
                    className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white"
                  >
                    {formatted.time}
                  </div>
                  <div
                    suppressHydrationWarning
                    className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400"
                  >
                    {formatted.dateLabel}
                  </div>
                </div>

                <CopyAction
                  size="xs"
                  display="icon"
                  content={formatted.isoCopy}
                  disabled={!isClient}
                  ariaLabel={`Copy ${zone.label} time`}
                  className="opacity-70 transition-opacity group-hover:opacity-100"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
