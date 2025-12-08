'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Glimmer 1 - Top Left / Blueish tone */}
      <div
        className={clsx(
          'absolute left-[-10%] top-[-10%] h-[65vw] w-[65vw] rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-30',
          'bg-blue-200/70 dark:bg-blue-800/50',
          '[animation-duration:_8000ms]'
        )}
      />
      {/* Glimmer 2 - Top Right / Purplish tone */}
      <div
        className={clsx(
          'absolute right-[-10%] top-[-10%] h-[55vw] w-[55vw] rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-30',
          'bg-purple-200/70 dark:bg-purple-800/50',
          '[animation-duration:_12000ms]'
        )}
      />
    </div>
  );
}
