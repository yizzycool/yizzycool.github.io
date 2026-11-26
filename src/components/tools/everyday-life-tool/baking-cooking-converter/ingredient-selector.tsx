'use client';

import type { IngredientCategory, IngredientEntry } from './types';

import { Wheat } from 'lucide-react';

import { Chip } from '@/components/ui/chip';
import { SearchInput } from '@/components/ui/input';

import LabelBar from '../../common/label-bar';
import { INGREDIENT_CATEGORIES } from './constants';
import IngredientChipItem from './ingredient-chip-item';

type Props = {
  category: IngredientCategory;
  onSelectCategory: (cat: IngredientCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  ingredients: readonly IngredientEntry[];
  selectedIngredient: IngredientEntry;
  onSelectIngredient: (id: string) => void;
};

/**
 * Frameless ingredient density browser with category filters and instant fuzzy filter input.
 */
export default function IngredientSelector({
  category,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  ingredients,
  selectedIngredient,
  onSelectIngredient,
}: Props) {
  return (
    <section
      aria-labelledby="ingredient-selector-heading"
      className="text-left"
    >
      <LabelBar
        id="ingredient-selector-heading"
        label="1. Select Ingredient"
        description={`Active: ${selectedIngredient.name} (${selectedIngredient.gramsPerUsCup} g per US cup${selectedIngredient.note ? ` · ${selectedIngredient.note}` : ''})`}
        icon={Wheat}
      />

      <div className="space-y-3">
        {/* Search & Category Strip */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Filter ingredients (e.g. flour, butter, honey)..."
            containerClassName="sm:w-72 shrink-0"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            {INGREDIENT_CATEGORIES.map((item) => (
              <Chip
                key={item.id}
                icon={item.icon}
                selected={category === item.id}
                onClick={() => onSelectCategory(item.id)}
                className="px-2.5 py-1 text-xs"
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Ingredient Tiles Grid */}
        {ingredients.length > 0 ? (
          <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((ingredient) => (
              <IngredientChipItem
                key={ingredient.id}
                ingredient={ingredient}
                selected={selectedIngredient.id === ingredient.id}
                onSelect={onSelectIngredient}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300/80 bg-white/40 px-4 py-6 text-center text-xs text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/30 dark:text-neutral-400">
            No ingredients matched &ldquo;{searchQuery}&rdquo;. Try another
            search or switch to All categories.
          </div>
        )}
      </div>
    </section>
  );
}
