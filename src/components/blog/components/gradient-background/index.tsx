'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Top Left / Blueish tone  */}
      <div
        className={clsx(
          'absolute left-[-10%] top-[-10%] h-[40vw] w-[40vw] rounded-full mix-blend-multiply blur-3xl',
          'animate-pulse opacity-60 dark:opacity-40',
          'bg-blue-400/10 dark:bg-blue-600/10',
          '[animation-duration:_8000ms]'
        )}
      />
      {/* Top Right / Purplish tone  */}
      <div
        className={clsx(
          'absolute bottom-[-10%] right-[-10%] h-[35vw] w-[35vw] rounded-full mix-blend-multiply blur-3xl',
          'opacity-60 dark:opacity-40',
          'bg-violet-400/10 dark:bg-violet-600/10'
        )}
      />
      {/* Center Top Subtle Highlight */}
      <div
        className={clsx(
          'absolute right-[20%] top-[10%] h-[25vw] w-[25vw] rounded-full mix-blend-multiply blur-[80px]',
          'opacity-40',
          'bg-purple-300/10 dark:bg-purple-900/10'
        )}
      />
    </div>
  );
}
