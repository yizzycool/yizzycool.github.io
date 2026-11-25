'use client';

import type { WifiCardTheme } from './types';

import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  theme: WifiCardTheme;
  selected: boolean;
  onSelect: (id: WifiCardTheme['id']) => void;
};

/**
 * Interactive preset swatch tile displaying the mini card palette and active state.
 */
export default function ThemeSwatchItem({ theme, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(theme.id)}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all',
        selected
          ? 'border-sky-500/80 bg-sky-50/70 ring-1 ring-sky-500/30 dark:border-sky-400/70 dark:bg-sky-950/30 dark:ring-sky-400/20'
          : 'border-neutral-200/80 bg-white/60 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700'
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        }}
      >
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: theme.accent }}
        />
        {selected && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white shadow">
            <Check size={10} strokeWidth={3} />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-neutral-800 dark:text-neutral-100">
          {theme.label}
        </span>
        <span className="block truncate text-[10px] text-neutral-500 dark:text-neutral-400">
          {theme.description}
        </span>
      </span>
    </button>
  );
}
