'use client';

import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { cn } from '@/utils/cn';
import { Tools } from '@/data/tools';
import HeaderBlock from './index-header-block';
import ToolsFilterBar from './tools-filter-bar';
import FavoritesSection from './favorites-section';
import ToolGroupSection from './tool-group-section';
import { ToolItem } from './tool-card';

const defaultSelectedCategory = 'All';

export default function ToolsIndex() {
  const { getFadeUpClass } = useGetTransitionClass();
  const { favoriteToolKeys, toggleFavorite, isFavorite } =
    useToolsPreferences();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    defaultSelectedCategory
  );

  // Flatten all tool items with group category ID for easy lookup
  const allToolItems = useMemo(() => {
    const items: (ToolItem & { groupKey: string })[] = [];
    Tools.forEach((group) => {
      group.items.forEach((item) => {
        items.push({
          ...item,
          groupKey: group.id,
        });
      });
    });
    return items;
  }, []);

  // Filtered Favorite tools
  const favoriteTools = useMemo(() => {
    return allToolItems.filter((tool) => favoriteToolKeys.includes(tool.key));
  }, [allToolItems, favoriteToolKeys]);

  // Categories metadata with count
  const categoriesMetaData = useMemo(() => {
    return Tools.map((group) => ({
      id: group.id,
      name: group.name,
      count: group.items.length,
    }));
  }, []);

  // Total count
  const totalToolsCount = allToolItems.length;

  // Filtered Tools Groups
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return Tools.map((group) => {
      // Category filter
      if (
        selectedCategory !== defaultSelectedCategory &&
        group.id !== selectedCategory
      ) {
        return null;
      }

      // Keyword search filter
      const matchingItems = group.items.filter((item) => {
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
        );
      });

      if (matchingItems.length === 0) {
        return null;
      }

      return {
        ...group,
        items: matchingItems,
      };
    }).filter(Boolean) as (typeof Tools)[number][];
  }, [searchQuery, selectedCategory]);

  const hasNoResults = filteredGroups.length === 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(defaultSelectedCategory);
  };

  return (
    <div className="mx-auto w-full text-left">
      {/* Title Header & Trust Badges */}
      <HeaderBlock />

      {/* Search & Category Filter Bar */}
      <ToolsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categoriesMetaData}
        totalToolsCount={totalToolsCount}
        className={getFadeUpClass('animate-delay-300')}
      />

      {/* Content Container */}
      <div
        className={cn('mt-8 space-y-12', getFadeUpClass('animate-delay-500'))}
      >
        {/* Pinned Favorite Tools Section (Shown if user has pinned tools and not searching) */}
        {!searchQuery && selectedCategory === defaultSelectedCategory && (
          <FavoritesSection
            favoriteTools={favoriteTools}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Filtered Category Tool Groups */}
        {!hasNoResults ? (
          filteredGroups.map((group) => (
            <ToolGroupSection
              key={group.id}
              group={group}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          /* Empty Search / Filter State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-neutral-800">
            <SearchX className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">
              No matching tools found
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              We couldn't find any tools matching "{searchQuery}". Try searching
              for another keyword or reset filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="shadow-xs mt-5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
