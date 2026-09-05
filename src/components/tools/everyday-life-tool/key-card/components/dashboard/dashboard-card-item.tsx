import type { CardData } from '../../types';

import { Eye } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/card';
import { SearchHighlight } from '@/components/ui/search-highlight';

import { DashboardTagList } from './dashboard-tag-list';

type DashboardCardItemProps = {
  card: CardData;
  isFocused: boolean;
  isCompact: boolean;
  searchQuery: string;
  selectedTag: string | null;
  onCardClick: (id: string) => void;
  onTagClick: (e: React.MouseEvent, tag: string) => void;
};

export function DashboardCardItem({
  card,
  isFocused,
  isCompact,
  searchQuery,
  selectedTag,
  onCardClick,
  onTagClick,
}: DashboardCardItemProps) {
  const versionCount = card.contents?.length || 0;

  return (
    <Card
      rounded="2xl"
      onClick={() => onCardClick(card.id)}
      className={cn(
        'group relative flex transform cursor-pointer flex-col justify-between text-left transition-all duration-200',
        isCompact ? 'p-3.5' : 'p-5',
        isFocused
          ? 'border-sky-500 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/40'
          : 'hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-md hover:shadow-sky-500/5 dark:hover:border-sky-500/60 dark:hover:shadow-black/60'
      )}
    >
      <div>
        {/* Header: Title, Keycap Badge & Quick Copy */}
        <div
          className={cn(
            'flex items-start justify-between gap-2.5',
            isCompact ? 'mb-2' : 'mb-3'
          )}
        >
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'line-clamp-2 font-bold leading-snug text-slate-900 transition-colors duration-200 dark:text-slate-100',
                isCompact ? 'text-xs' : 'text-sm sm:text-base'
              )}
            >
              <SearchHighlight text={card.title} search={searchQuery} />
            </h3>
          </div>

          {/* Hotkey Keycap & Quick Copy Action */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Quick Copy Button */}

            {/* 3D Tactile Keycap Badge */}
            {card.key && (
              <kbd
                className={cn(
                  'inline-flex items-center justify-center rounded-lg border font-mono font-black uppercase transition-transform duration-150 active:translate-y-0.5',
                  isCompact
                    ? 'h-6 min-w-6 px-1 text-[10px]'
                    : 'h-7 min-w-7 px-1.5 text-xs',
                  'border-neutral-300/90 bg-gradient-to-b from-white to-neutral-100 text-slate-800 shadow-[0_2px_0_0_rgba(0,0,0,0.15)]',
                  'dark:border-neutral-700 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 dark:text-slate-100 dark:shadow-[0_2px_0_0_rgba(255,255,255,0.1)]'
                )}
              >
                {card.key}
              </kbd>
            )}
          </div>
        </div>

        {/* Tag List Badges */}
        <DashboardTagList
          tagsString={card.tags}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          isCompact={isCompact}
          onTagClick={onTagClick}
        />
      </div>

      {/* Bottom Metadata & Version Indicator */}
      {!isCompact && (
        <div
          className={cn(
            'mt-auto flex items-center justify-between border-t pt-2.5 text-xs',
            'border-neutral-100 dark:border-neutral-800/80',
            'text-slate-400 dark:text-slate-500'
          )}
        >
          <span className="flex items-center gap-1 text-[11px]">
            <Eye size={12} className="text-slate-400" />
            <span>Details</span>
            {versionCount > 1 && (
              <span className="py-0.2 ml-1 rounded-full bg-neutral-100 px-1.5 text-[9px] font-semibold text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                {versionCount} tabs
              </span>
            )}
          </span>

          {card.key && (
            <span className="text-[10px] font-medium tracking-wide text-slate-400">
              Press{' '}
              <span className="font-bold text-sky-600 dark:text-sky-400">
                [{card.key.toUpperCase()}]
              </span>
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
