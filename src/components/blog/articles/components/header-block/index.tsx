'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import clsx from 'clsx';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className="text-center md:text-left">
      <h1
        className={clsx(
          'mb-4 text-4xl font-extrabold tracking-tight md:text-5xl',
          getFadeUpClass('animate-delay-100')
        )}
      >
        Writing &{' '}
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Thinking
        </span>
      </h1>
      <p
        className={clsx(
          'text-lg text-neutral-600 dark:text-neutral-400',
          getFadeUpClass('animate-delay-200')
        )}
      >
        Exploration notes on Front-end technologies, Web APIs, and Software
        Engineering.
      </p>
    </div>
  );
}
