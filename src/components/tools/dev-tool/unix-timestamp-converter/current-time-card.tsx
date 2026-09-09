'use client';

import { ClockCheck, Pause, Play } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Surface } from '@/components/ui/surface';
import { CopyAction } from '@/components/shared/action-button';
import useIsClient from '@/hooks/lifecycle/use-is-client';

type Props = {
  now: Date;
  isPaused: boolean;
  onTogglePause: () => void;
  deviceTimezone: string;
};

export default function CurrentTimeCard({
  now,
  isPaused,
  onTogglePause,
  deviceTimezone,
}: Props) {
  const currentSec = Math.floor(now.getTime() / 1000);
  const currentMs = now.getTime();

  const isClient = useIsClient();

  return (
    <Card animation="fade-in" className="relative overflow-hidden text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle icon={ClockCheck}>Current Device Time</CardTitle>

        {/* Live Clock Control */}
        <div className="flex items-center gap-2">
          <Button
            variant={isPaused ? 'primary' : 'surface'}
            bordered
            size="xs"
            icon={isPaused ? Play : Pause}
            onClick={onTogglePause}
            ariaLabel={isPaused ? 'Resume live clock' : 'Pause live clock'}
          >
            {isPaused ? 'Resume Clock' : 'Pause Clock'}
          </Button>
        </div>
      </div>

      {/* Separator */}
      <Separator className="-mx-6 my-5" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Local Time */}
        <Surface className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Local Time
            </span>
            <Badge
              size="xs"
              rounded="base"
              className="px-1.5 py-0.5 text-[10px] font-medium"
            >
              {deviceTimezone}
            </Badge>
          </div>
          <p className="font-mono text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isClient ? now.toLocaleTimeString() : '---'}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {isClient
              ? now.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '---'}
          </p>
        </Surface>

        {/* UTC / GMT Time */}
        <Surface className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              UTC / GMT
            </span>
            <Badge
              size="xs"
              rounded="base"
              className="px-1.5 py-0.5 text-[10px] font-medium"
            >
              UTC+0
            </Badge>
          </div>
          <p className="font-mono text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isClient ? now.toUTCString().slice(17, 25) : '---'}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {isClient ? now.toUTCString().slice(0, 16) : '---'}
          </p>
        </Surface>

        {/* Unix Timestamps (Seconds & Milliseconds) */}
        <Surface
          variant="blue"
          className="flex flex-col justify-between gap-2.5 p-4"
        >
          {/* Seconds */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Seconds
              </span>
              <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                {isClient ? currentSec : '---'}
              </p>
            </div>
            <CopyAction
              display="icon"
              content={currentSec.toString()}
              ariaLabel="Copy current seconds"
            />
          </div>

          <div className="border-t border-blue-100 dark:border-blue-900/30" />

          {/* Milliseconds */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Milliseconds
              </span>
              <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isClient ? currentMs : '---'}
              </p>
            </div>
            <CopyAction
              display="icon"
              content={currentMs.toString()}
              ariaLabel="Copy current milliseconds"
            />
          </div>
        </Surface>
      </div>
    </Card>
  );
}
