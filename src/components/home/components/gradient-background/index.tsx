'use client';

import clsx from 'clsx';

export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className={clsx(
          'duration-[4000ms] absolute left-[-10%] top-[-10%] h-96 w-96 animate-pulse rounded-full opacity-20 mix-blend-multiply blur-3xl filter',
          'bg-indigo-200 dark:bg-indigo-900'
        )}
      />
      <div
        className={clsx(
          'duration-[5000ms] absolute right-[-10%] top-[-10%] h-96 w-96 animate-pulse rounded-full opacity-20 mix-blend-multiply blur-3xl filter delay-1000',
          'bg-purple-200 dark:bg-purple-900'
        )}
      />
      <div
        className={clsx(
          'duration-[6000ms] absolute bottom-[-20%] left-[20%] h-96 w-96 animate-pulse rounded-full opacity-20 mix-blend-multiply blur-3xl filter delay-700',
          'bg-pink-200 dark:bg-pink-900'
        )}
      />
    </div>
  );
}
