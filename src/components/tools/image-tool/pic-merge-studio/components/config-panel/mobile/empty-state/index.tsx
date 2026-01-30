'use client';

import clsx from 'clsx';
import { ImageIcon, MousePointerClick } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center gap-4 text-left">
      <div className="group relative">
        {/* Layered Icon Composition */}
        <div className="relative">
          <div className="h-16 w-16">
            <div className="h-4 w-16 animate-bounce [animation-duration:_3000ms]">
              <div
                className={clsx(
                  'flex h-16 w-16 items-center justify-center rounded-[12px] shadow-2xl',
                  'bg-white dark:bg-neutral-800',
                  'border border-neutral-100 dark:border-neutral-700'
                )}
              >
                <ImageIcon
                  size={24}
                  className="text-neutral-300 dark:text-neutral-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
          <div
            className={clsx(
              'animate-wiggle-more animate-duration-[2000ms] animate-infinite',
              'absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-3xl shadow-xl',
              'bg-neutral-900 dark:bg-white',
              'border-4 border-white dark:border-neutral-900'
            )}
          >
            <MousePointerClick
              size={12}
              className="text-white dark:text-neutral-900"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Ready to edit?
          </h3>
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
            <div className="aspect-square h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-black uppercase text-neutral-500">
              Ready
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Select any image to unlock advanced tools.
        </p>
      </div>
    </div>
  );
}
