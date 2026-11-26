'use client';

import type { IngredientEntry } from './types';

import { cn } from '@/utils/cn';

import {
  INGREDIENT_CATEGORY_STYLES,
  INGREDIENT_ICON_OVERRIDES,
} from './constants';

type Props = {
  ingredient: IngredientEntry;
  selected: boolean;
  onSelect: (id: string) => void;
};

/**
 * Selectable ingredient tile displaying category-tinted Lucide icon, name, and reference g/US-cup weight.
 */
export default function IngredientChipItem({
  ingredient,
  selected,
  onSelect,
}: Props) {
  const categoryStyle = INGREDIENT_CATEGORY_STYLES[ingredient.category];
  const Icon = INGREDIENT_ICON_OVERRIDES[ingredient.id] ?? categoryStyle.icon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(ingredient.id)}
      className={cn(
        'flex items-center justify-between gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all',
        selected
          ? 'border-sky-500/80 bg-sky-50/75 text-sky-900 ring-1 ring-sky-500/30 dark:border-sky-400/70 dark:bg-sky-950/35 dark:text-sky-100 dark:ring-sky-400/20'
          : 'border-neutral-200/80 bg-white/60 text-neutral-700 hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-200 dark:hover:border-neutral-700'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
            selected
              ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300'
              : categoryStyle.badgeClass
          )}
        >
          <Icon size={14} strokeWidth={2} />
        </span>
        <span className="truncate text-xs font-medium">{ingredient.name}</span>
      </div>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
        {ingredient.gramsPerUsCup}g/c
      </span>
    </button>
  );
}
