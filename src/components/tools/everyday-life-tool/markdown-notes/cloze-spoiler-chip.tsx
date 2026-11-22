'use client';

import type { MouseEvent } from 'react';

import { useState } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  text: string;
  revealAll?: boolean;
};

export default function ClozeSpoilerChip({ text, revealAll = false }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);

  const isShown = revealAll || isRevealed;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!revealAll) {
      setIsRevealed((prev) => !prev);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isShown ? 'Hide answer' : 'Reveal hidden answer'}
      title={isShown ? 'Click to hide answer' : 'Click to reveal answer'}
      className={cn(
        'mx-0.5 inline-flex cursor-pointer items-center rounded-md px-1.5 py-0.5 align-baseline text-[0.92em] font-medium transition-all duration-200',
        isShown
          ? 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/25 dark:bg-sky-400/15 dark:text-sky-200 dark:ring-sky-400/30'
          : 'bg-neutral-300/65 text-slate-700 hover:bg-neutral-300/90 dark:bg-neutral-700/70 dark:text-slate-200 dark:hover:bg-neutral-600/80'
      )}
    >
      <span
        className={cn(
          'transition-all duration-200',
          !isShown && 'select-none opacity-70 blur-[4.5px]'
        )}
      >
        {text}
      </span>
    </button>
  );
}
