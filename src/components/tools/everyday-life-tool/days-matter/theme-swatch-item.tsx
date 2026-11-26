'use client';

import type { PosterTheme } from './types';

import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  theme: PosterTheme;
  selected: boolean;
  onSelect: (id: PosterTheme['id']) => void;
};

/**
 * Interactive gradient swatch tile for selecting the social poster theme.
 */
export default function ThemeSwatchItem({ theme, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(theme.id)}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all',
        selected
          ? 'border-sky-500/80 bg-sky-50/75 ring-1 ring-sky-500/30 dark:border-sky-400/70 dark:bg-sky-950/35 dark:ring-sky-400/20'
          : 'border-neutral-200/80 bg-white/60 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700'
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 shadow-sm dark:border-white/10"
        style={{ background: theme.gradientCss }}
      >
        {selected && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-900 shadow">
            <Check size={10} strokeWidth={3} />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-medium text-neutral-700 dark:text-neutral-200">
        {theme.label}
      </span>
    </button>
  );
}
