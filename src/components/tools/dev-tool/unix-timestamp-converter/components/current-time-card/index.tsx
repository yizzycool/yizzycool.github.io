'use client';

import { ClockCheck } from 'lucide-react';
import Card from '@/components/common/card';
import CardTitle from '@/components/common/card/title';

type Props = {
  now: Date | null;
};

export default function CurrentTimeCard({ now }: Props) {
  return (
    <Card animation="fade-in">
      <CardTitle icon={ClockCheck}>Current Device Time</CardTitle>

      {/* Separate */}
      <div className="-mx-6 my-6 border-b border-neutral-200 dark:border-neutral-700" />

      <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start md:gap-4">
        <div className="text-center md:text-left">
          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Local Time
          </p>
          <h2 className="font-mono text-2xl font-bold tracking-wider text-neutral-900 dark:text-white">
            {now ? now.toLocaleString() : '---'}
          </h2>
        </div>
        <div className="text-center md:text-right">
          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Unix Timestamp
          </p>
          <p className="font-mono text-lg">
            {now ? Math.floor(now.getTime() / 1000) : '---'}
          </p>

          <div className="mt-8" />

          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            UTC Time
          </p>
          <p className="font-mono text-lg">{now ? now.toUTCString() : '---'}</p>
        </div>
      </div>
    </Card>
  );
}
