import type { RefObject } from 'react';
import type { SortOrderOption } from '../../types';

import {
  Plus,
  Trash2,
  RotateCcw,
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ManagementToolbarProps = {
  search: string;
  onSearchChange: (val: string) => void;
  cardsCount: number;
  filteredCount: number;
  isAllCollapsed: boolean;
  onToggleAllCollapsed: () => void;
  sortOrder: SortOrderOption;
  onSortOrderChange: (val: SortOrderOption) => void;
  onImportClick: () => void;
  onExport: () => void;
  onResetClick: () => void;
  onDeleteAllClick: () => void;
  onAddCard: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type SortCategory = 'default' | 'title' | 'hotkey';

const SORT_CATEGORIES: {
  category: SortCategory;
  label: string;
  ascVal: SortOrderOption;
  descVal: SortOrderOption;
}[] = [
  {
    category: 'default',
    label: 'Default',
    ascVal: 'asc',
    descVal: 'desc',
  },
  {
    category: 'title',
    label: 'Title',
    ascVal: 'title-asc',
    descVal: 'title-desc',
  },
  {
    category: 'hotkey',
    label: 'Hotkey',
    ascVal: 'hotkey-asc',
    descVal: 'hotkey-desc',
  },
];

function getSortCategoryState(sortOrder: SortOrderOption): {
  category: SortCategory;
  isAsc: boolean;
} {
  if (sortOrder === 'desc') return { category: 'default', isAsc: false };
  if (sortOrder === 'title-desc') return { category: 'title', isAsc: false };
  if (sortOrder === 'hotkey-desc') return { category: 'hotkey', isAsc: false };
  if (sortOrder === 'title' || sortOrder === 'title-asc') {
    return { category: 'title', isAsc: true };
  }
  if (sortOrder === 'hotkey' || sortOrder === 'hotkey-asc') {
    return { category: 'hotkey', isAsc: true };
  }
  return { category: 'default', isAsc: true };
}

export function ManagementToolbar({
  search,
  onSearchChange,
  cardsCount,
  filteredCount,
  isAllCollapsed,
  onToggleAllCollapsed,
  sortOrder,
  onSortOrderChange,
  onImportClick,
  onExport,
  onResetClick,
  onDeleteAllClick,
  onAddCard,
  fileInputRef,
  onFileChange,
}: ManagementToolbarProps) {
  const currentSortState = getSortCategoryState(sortOrder);

  const handleSortClick = (item: (typeof SORT_CATEGORIES)[number]) => {
    if (currentSortState.category === item.category) {
      // Toggle direction between asc and desc
      onSortOrderChange(currentSortState.isAsc ? item.descVal : item.ascVal);
    } else {
      // Switch to new category in ascending order
      onSortOrderChange(item.ascVal);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 dark:border-neutral-800/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Quick Search Filter */}
        <div className="w-full md:max-w-xs lg:max-w-sm">
          <Input
            type="text"
            placeholder="Filter cards in management..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            icon={Search}
            className="text-xs"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto md:justify-end">
          {/* Group A: Import / Export */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              rounded="xl"
              icon={Upload}
              onClick={onImportClick}
              title="Import JSON"
              ariaLabel="Import JSON"
              className="shadow-2xs px-2.5 text-xs font-semibold sm:px-3"
            >
              <span className="hidden xl:inline">Import</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              rounded="xl"
              icon={Download}
              onClick={onExport}
              title="Export JSON"
              ariaLabel="Export JSON"
              className="shadow-2xs px-2.5 text-xs font-semibold sm:px-3"
            >
              <span className="hidden xl:inline">Export</span>
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={onFileChange}
          />

          <div className="flex-1 md:flex-none" />
          <div className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-800" />

          {/* Group B: Delete All & Reset */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              rounded="xl"
              icon={RotateCcw}
              onClick={onResetClick}
              title="Reset library"
              ariaLabel="Reset library"
              className="shadow-2xs px-2.5 text-xs font-semibold sm:px-3"
            >
              <span className="hidden xl:inline">Reset</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              rounded="xl"
              icon={Trash2}
              onClick={onDeleteAllClick}
              title="Delete all cards"
              ariaLabel="Delete all cards"
              className={cn(
                'shadow-2xs px-2.5 text-xs font-semibold sm:px-3',
                'transition-colors',
                'hover:border-rose-300 dark:hover:border-rose-900/60',
                'hover:bg-rose-50 dark:hover:bg-rose-950/40',
                'hover:text-rose-600 dark:hover:text-rose-400'
              )}
            >
              <span className="hidden xl:inline">Delete All</span>
            </Button>
          </div>

          <div className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-800" />

          {/* Group C: Add Card Primary CTA */}
          <Button
            variant="primary"
            size="sm"
            rounded="xl"
            icon={Plus}
            onClick={onAddCard}
            title="Add new card"
            ariaLabel="Add new card"
            className="shadow-xs px-3.5 py-1.5 text-xs font-semibold"
          >
            <span>Add Card</span>
          </Button>
        </div>
      </div>

      {/* Sub-bar: Expand/Collapse All and Sort Order */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={isAllCollapsed ? ChevronDown : ChevronUp}
            onClick={onToggleAllCollapsed}
            className="text-xs font-medium"
            ariaLabel={isAllCollapsed ? 'Expand All' : 'Collapse All'}
          >
            <span>{isAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
          </Button>
          <span className="text-[11px] text-slate-400">
            Showing {filteredCount} of {cardsCount} cards
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Sort:</span>
          <div className="inline-flex rounded-xl border border-neutral-200/80 bg-neutral-100 p-0.5 dark:border-neutral-700/80 dark:bg-neutral-800">
            {SORT_CATEGORIES.map((item) => {
              const isActive = currentSortState.category === item.category;
              const isAsc = currentSortState.isAsc;

              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => handleSortClick(item)}
                  title={
                    isActive
                      ? `${item.label} (${isAsc ? 'Ascending' : 'Descending'}) - Click to reverse`
                      : `Sort by ${item.label}`
                  }
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'shadow-2xs bg-white text-sky-600 dark:bg-neutral-900 dark:text-sky-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive &&
                    (isAsc ? (
                      <ArrowUp size={12} className="shrink-0 stroke-[2.5]" />
                    ) : (
                      <ArrowDown size={12} className="shrink-0 stroke-[2.5]" />
                    ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
