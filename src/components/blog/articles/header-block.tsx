'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className="text-center md:text-left">
      <h1
        className={cn(
          'text-3xl font-extrabold tracking-tight md:text-4xl',
          'dark:text-neutral-300',
          getFadeUpClass('animate-delay-100')
        )}
      >
        Writing &{' '}
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
          Thinking
        </span>
      </h1>
      <p
        className={cn(
          'mt-3 text-lg font-light text-neutral-600 dark:text-neutral-400',
          getFadeUpClass('animate-delay-200')
        )}
      >
        Exploration notes on Front-end technologies, Web APIs, and Software
        Engineering.
      </p>
    </div>
  );
}
