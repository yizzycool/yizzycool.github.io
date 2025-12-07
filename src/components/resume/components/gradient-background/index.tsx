'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Glimmer 1 - Top Left / Blueish tone */}
      <div
        className={clsx(
          'absolute -left-[20%] -top-[30%] h-[70vw] w-[70vw] rounded-full mix-blend-screen blur-[120px] dark:mix-blend-overlay',
          'opacity-20 dark:opacity-30',
          'bg-blue-200/70 dark:bg-blue-800/50',
          'duration-[8000ms] animate-pulse'
        )}
      />
      {/* Glimmer 2 - Top Right / Purplish tone */}
      <div
        className={clsx(
          'absolute -right-[20%] -top-[30%] h-[70vw] w-[70vw] rounded-full mix-blend-screen blur-[120px] dark:mix-blend-overlay',
          'opacity-20 dark:opacity-30',
          'bg-purple-200/70 dark:bg-purple-800/50',
          'duration-[12000ms] animate-pulse'
        )}
      />
    </div>
  );
}
