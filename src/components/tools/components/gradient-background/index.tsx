'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Top Left - Blueish */}
      <div
        className={clsx(
          'absolute left-[-10%] top-[-10%] h-[50vw] w-[50vw] rounded-full mix-blend-multiply blur-[120px]',
          'animate-pulse opacity-60 dark:opacity-40',
          'bg-blue-400/10 dark:bg-blue-600/10',
          '[animation-duration:_8000ms]'
        )}
      />

      {/* Top Right - Purpleish */}
      <div
        className={clsx(
          'absolute right-[-10%] top-[-5%] h-[45vw] w-[45vw] rounded-full mix-blend-multiply blur-[120px]',
          'opacity-60 dark:opacity-40',
          'bg-purple-300/10 dark:bg-purple-600/10'
        )}
      />

      {/* Bottom Center - Cyanish */}
      <div
        className={clsx(
          'absolute bottom-0 left-[20%] h-[40vw] w-[60vw] rounded-full mix-blend-multiply blur-[120px]',
          'opacity-60 dark:opacity-40',
          'bg-cyan-300/10 dark:bg-cyan-600/10'
        )}
      />
    </div>
  );
}
