'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className="text-center md:text-left">
      <h1
        className={cn(
          'text-3xl font-black tracking-tight md:text-4xl',
          'text-neutral-900 dark:text-white',
          getFadeUpClass('animate-delay-100')
        )}
      >
        Tools Directory
      </h1>
      <p
        className={cn(
          'mt-3 text-lg font-light text-neutral-500 dark:text-neutral-400',
          getFadeUpClass('animate-delay-200')
        )}
      >
        A completely free toolkit featuring everyday utilities, an image editor,
        developer tools, and a built-in Chrome AI assistant.
      </p>
    </div>
  );
}
