'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Glimmer 1 - Top Left */}
      <div
        className={clsx(
          'absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-30',
          'bg-indigo-200 dark:bg-indigo-900',
          '[animation-duration:_4000ms]'
        )}
      />
      {/* Glimmer 2 - Top Right */}
      <div
        className={clsx(
          'absolute right-[-10%] top-[-10%] h-96 w-96 rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-30 delay-1000',
          'bg-purple-200 dark:bg-purple-900',
          '[animation-duration:_5000ms]'
        )}
      />
      {/* Glimmer 3 - Bottom Left */}
      <div
        className={clsx(
          'absolute bottom-[-20%] left-[20%] h-96 w-96 rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-30 delay-700',
          'bg-pink-200 dark:bg-pink-900',
          '[animation-duration:_6000ms]'
        )}
      />
    </div>
  );
}
