'use client';

import clsx from 'clsx';
import { ImageIcon, MousePointerClick } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="group relative mb-10">
        {/* Layered Icon Composition */}
        <div className="relative">
          <div className="h-32 w-32">
            <div
              className={clsx(
                'h-8 w-32',
                'animate-bounce [animation-duration:_3000ms]'
              )}
            >
              <div
                className={clsx(
                  'flex h-32 w-32 items-center justify-center rounded-[48px] shadow-2xl',
                  'bg-white dark:bg-neutral-800',
                  'border border-neutral-100 dark:border-neutral-700'
                )}
              >
                <ImageIcon
                  size={48}
                  className="text-neutral-300 dark:text-neutral-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
          <div
            className={clsx(
              'absolute -bottom-2 -right-2 flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl',
              'bg-neutral-900 dark:bg-white',
              'border-4 border-white dark:border-neutral-900',
              'rotate-12 transform transition-transform duration-500',
              'group-hover:rotate-0'
            )}
          >
            <MousePointerClick
              size={24}
              className="text-white dark:text-neutral-900"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[280px] space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Ready to edit?
        </h3>
        <p className="text-sm font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">
          Select any image on the canvas to unlock advanced refinement tools.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-3 rounded-full bg-neutral-100 px-5 py-2.5 dark:bg-neutral-800">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Awaiting Selection
        </span>
      </div>
    </div>
  );
}
