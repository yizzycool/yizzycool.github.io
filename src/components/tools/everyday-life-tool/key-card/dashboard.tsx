import type { CardData } from './types';

import { Keyboard, Eye } from 'lucide-react';

import { cn } from '@/utils/cn';
import { highlightText } from './utils';
import Badge from '@/components/common/badge';
import Button from '@/components/common/button';
import Switch from '@/components/common/switch';

type DashboardProps = {
  filteredCards: CardData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCardClick: (id: string) => void;
  setMode: (mode: 'dashboard' | 'management') => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
};

export default function Dashboard({
  filteredCards,
  searchQuery,
  setSearchQuery,
  onCardClick,
  setMode,
  isCompact,
  setIsCompact,
}: DashboardProps) {
  if (filteredCards.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center',
          'border-neutral-200 dark:border-neutral-700'
        )}
      >
        <Keyboard
          size={48}
          className="mb-3 text-neutral-300 dark:text-neutral-700"
        />
        <p className="text-base font-semibold text-neutral-500 dark:text-neutral-400">
          {searchQuery
            ? 'No matching cheat sheets found'
            : 'Your card library is currently empty'}
        </p>
        {searchQuery ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-sky-500"
            onClick={() => setSearchQuery('')}
          >
            Clear Search Filter
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => setMode('management')}
          >
            Go to Management to Add Cards
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Switch Layout Mode */}
      <div className="flex justify-end px-1">
        <Switch
          checked={isCompact}
          onChange={setIsCompact}
          label="Compact Mode"
        />
      </div>

      <div
        className={cn(
          isCompact
            ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
            : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'group relative flex transform cursor-pointer flex-col justify-between rounded-2xl text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5',
              isCompact ? 'p-3.5' : 'p-5',
              'overflow-hidden',
              'border border-neutral-200 dark:border-neutral-700',
              'bg-white/40 dark:bg-neutral-900/40',
              'hover:border-blue-500/50 dark:hover:border-blue-500/50',
              'hover:shadow-lg hover:shadow-sky-500/5'
            )}
            onClick={() => onCardClick(card.id)}
          >
            <div>
              {/* Header with Title and Keyboard indicator */}
              <div
                className={cn(
                  'flex items-start justify-between gap-3',
                  isCompact ? 'mb-2' : 'mb-3'
                )}
              >
                <h3
                  className={cn(
                    'line-clamp-2 font-bold leading-snug text-neutral-900 transition-colors duration-200 dark:text-neutral-100',
                    isCompact ? 'text-sm' : 'text-base'
                  )}
                >
                  {highlightText(card.title, searchQuery)}
                </h3>
                {card.key && (
                  <kbd
                    className={cn(
                      'flex items-center justify-center rounded-lg border font-black uppercase shadow-sm',
                      isCompact
                        ? 'h-6 min-w-6 px-1 text-[9px]'
                        : 'h-7 min-w-7 px-1.5 text-xs',
                      'border-neutral-300 bg-neutral-100 text-neutral-800',
                      'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                    )}
                  >
                    {card.key}
                  </kbd>
                )}
              </div>

              {/* Tag list badges */}
              <div
                className={cn(
                  'flex flex-wrap gap-1.5',
                  isCompact ? 'mb-1' : 'mb-4'
                )}
              >
                {card.tags.split(',').map((tag, idx) => {
                  const cleanTag = tag.trim();
                  if (!cleanTag) return null;
                  return (
                    <Badge
                      key={idx}
                      variant="blue"
                      size="xs"
                      className="inline-block max-w-full overflow-hidden text-ellipsis text-nowrap text-[10px]"
                    >
                      {highlightText(cleanTag, searchQuery)}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Card bottom click metadata */}
            {!isCompact && (
              <div
                className={cn(
                  'mt-auto flex items-center justify-between border-t pt-3 text-xs',
                  'border-neutral-100 dark:border-neutral-700/80',
                  'text-neutral-400 dark:text-neutral-500'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Eye
                    size={13}
                    className="text-neutral-400 dark:text-neutral-500"
                  />
                  Click to view details
                </span>
                {card.key && (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
                    Press [{card.key.toUpperCase()}]
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
