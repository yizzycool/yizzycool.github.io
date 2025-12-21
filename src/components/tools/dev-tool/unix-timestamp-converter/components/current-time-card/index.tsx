'use client';

import Card from '@/components/common/card';

type Props = {
  now: Date | null;
};

export default function CurrentTimeCard({ now }: Props) {
  return (
    <Card animation="fade-in">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start md:gap-4">
        <div className="text-center md:text-left">
          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Current Unix Timestamp
          </p>
          <h2 className="font-mono text-4xl font-bold tracking-wider text-neutral-900 dark:text-white">
            {now ? Math.floor(now.getTime() / 1000) : '---'}
          </h2>
        </div>
        <div className="text-center md:text-right">
          <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Current UTC Time
          </p>
          <p className="font-mono text-lg">{now ? now.toUTCString() : '---'}</p>

          <p className="mb-4 mt-8 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Current Local Time
          </p>
          <p className="font-mono text-lg">
            {now ? now.toLocaleString() : '---'}
          </p>
        </div>
      </div>
    </Card>
  );
}
