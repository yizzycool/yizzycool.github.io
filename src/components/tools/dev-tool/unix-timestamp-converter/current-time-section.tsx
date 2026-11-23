'use client';

import { Activity, Clock, Pause, Play } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';

type Props = {
  now: Date;
  isPaused: boolean;
  onTogglePause: () => void;
  deviceTimezone: string;
};

export default function CurrentTimeSection({
  now,
  isPaused,
  onTogglePause,
  deviceTimezone,
}: Props) {
  const isClient = useIsClient();
  const currentSec = Math.floor(now.getTime() / 1000);
  const currentMs = now.getTime();

  return (
    <div
      className={cn(
        'shadow-xs relative w-full overflow-hidden rounded-2xl border p-5 text-left sm:p-6',
        'border-neutral-200/80 bg-white/80 backdrop-blur-md',
        'dark:border-neutral-800 dark:bg-neutral-900/70'
      )}
    >
      {/* Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10"
      />

      {/* Top Controls & Status Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Live Unix Epoch
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  isPaused
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                )}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {!isPaused && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={cn(
                      'relative inline-flex h-1.5 w-1.5 rounded-full',
                      isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                  />
                </span>
                {isPaused ? 'Paused' : 'Live'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Seconds elapsed since Jan 01, 1970 UTC
            </p>
          </div>
        </div>

        {/* Stopwatch Controls & Quick Copy */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isPaused ? 'primary' : 'surface'}
            bordered
            size="xs"
            rounded="lg"
            icon={isPaused ? Play : Pause}
            onClick={onTogglePause}
            ariaLabel={isPaused ? 'Resume live clock' : 'Pause live clock'}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <CopyAction
            content={isClient ? currentSec.toString() : ''}
            label="Copy Seconds"
            title="Copy current Unix timestamp in seconds"
            disabled={!isClient}
          />
          <CopyAction
            content={isClient ? currentMs.toString() : ''}
            label="Copy ms"
            title="Copy current Unix timestamp in milliseconds"
            disabled={!isClient}
          />
        </div>
      </div>

      {/* Hero Epoch Display */}
      <div className="relative mt-5 flex flex-col gap-4 border-t border-neutral-200/70 pt-5 lg:flex-row lg:items-end lg:justify-between dark:border-neutral-800/80">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span
              suppressHydrationWarning
              className="font-mono text-4xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-5xl dark:text-white"
            >
              {isClient ? currentSec : '----------'}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              sec
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-sky-500" />
            <span>Milliseconds:</span>
            <span
              suppressHydrationWarning
              className="font-semibold tabular-nums text-slate-700 dark:text-slate-200"
            >
              {isClient ? currentMs : '-------------'}
            </span>
          </div>
        </div>

        {/* Device Local vs UTC Quick Readout */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:min-w-[380px]">
          <div className="rounded-xl border border-neutral-200/70 bg-slate-50/70 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Local Time
              </span>
              <Badge
                size="xs"
                rounded="base"
                className="max-w-[120px] truncate px-1.5 py-0 text-[10px]"
              >
                {deviceTimezone}
              </Badge>
            </div>
            <div
              suppressHydrationWarning
              className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white"
            >
              {isClient ? now.toLocaleTimeString() : '--:--:--'}
            </div>
            <div
              suppressHydrationWarning
              className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
            >
              {isClient
                ? now.toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '---'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200/70 bg-slate-50/70 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                UTC / GMT
              </span>
              <Badge
                size="xs"
                rounded="base"
                className="px-1.5 py-0 text-[10px]"
              >
                UTC+0
              </Badge>
            </div>
            <div
              suppressHydrationWarning
              className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white"
            >
              {isClient ? now.toUTCString().slice(17, 25) : '--:--:--'}
            </div>
            <div
              suppressHydrationWarning
              className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
            >
              {isClient ? now.toUTCString().slice(0, 16) : '---'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
