'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CopyAction } from '@/components/shared/action-button';
import { TIME_INTERVALS } from './constants';

export default function ReferenceCard() {
  return (
    <Card animation="fade-in" className="text-left">
      <CardTitle icon={BookOpen}>Time Intervals Quick Reference</CardTitle>

      {/* Separator */}
      <Separator className="-mx-6 my-5" />

      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Common time intervals in seconds and milliseconds for caching, TTL, JWT
        expiration, and cookie age calculations.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-slate-400 dark:border-neutral-700 dark:text-slate-500">
              <th className="pb-2 font-semibold uppercase tracking-wider">
                Interval
              </th>
              <th className="pb-2 font-semibold uppercase tracking-wider">
                Seconds
              </th>
              <th className="pb-2 font-semibold uppercase tracking-wider">
                Milliseconds
              </th>
            </tr>
          </thead>
          <tbody className="w-full divide-y divide-neutral-100 font-mono dark:divide-neutral-800">
            {TIME_INTERVALS.map((item) => (
              <tr
                key={item.unit}
                className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30"
              >
                <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                  {item.unit}
                </td>
                <td className="group py-2.5 text-blue-600 dark:text-blue-400">
                  <div className="flex items-center justify-between gap-2">
                    {item.seconds.toLocaleString()}
                    <div className="relative mr-4 hidden sm:block">
                      <CopyAction
                        size="xs"
                        display="icon"
                        content={item.seconds.toString()}
                        ariaLabel={`Copy ${item.seconds} seconds`}
                        className="absolute right-0 top-1/2 hidden -translate-y-1/2 group-hover:block"
                      />
                    </div>
                  </div>
                </td>
                <td className="group py-2.5 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between gap-2">
                    {item.milliseconds.toString()}
                    <div className="relative mr-4 hidden sm:block">
                      <CopyAction
                        display="icon"
                        content={item.milliseconds.toString()}
                        ariaLabel={`Copy ${item.milliseconds} milliseconds`}
                        className="absolute right-0 top-1/2 hidden -translate-y-1/2 group-hover:block"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
