import type { CardData } from './types';

import { Keyboard, Eye } from 'lucide-react';

import { cn } from '@/utils/cn';
import { highlightText } from './utils';
import Badge from '@/components/common/badge';
import Button from '@/components/common/button';

type DashboardProps = {
  filteredCards: CardData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCardClick: (id: string) => void;
  setMode: (mode: 'dashboard' | 'management') => void;
};

export default function Dashboard({
  filteredCards,
  searchQuery,
  setSearchQuery,
  onCardClick,
  setMode,
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCards.map((card) => (
        <div
          key={card.id}
          className={cn(
            'group relative flex transform cursor-pointer flex-col justify-between rounded-2xl p-5 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5',
            'border border-neutral-200 dark:border-neutral-700',
            'bg-white/40 dark:bg-neutral-900/40',
            'hover:border-blue-400 dark:hover:border-blue-400',
            'hover:shadow-lg hover:shadow-sky-500/5'
          )}
          onClick={() => onCardClick(card.id)}
        >
          <div>
            {/* Header with Title and Keyboard indicator */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 transition-colors duration-200 dark:text-neutral-100">
                {highlightText(card.title, searchQuery)}
              </h3>
              {card.key && (
                <kbd
                  className={cn(
                    'flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-xs font-black uppercase shadow-sm',
                    'border-neutral-300 bg-neutral-100 text-neutral-800',
                    'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                  )}
                >
                  {card.key}
                </kbd>
              )}
            </div>

            {/* Tag list badges */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {card.tags.split(',').map((tag, idx) => {
                const cleanTag = tag.trim();
                if (!cleanTag) return null;
                return (
                  <Badge key={idx} variant="blue" size="xs">
                    {highlightText(cleanTag, searchQuery)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Card bottom click metadata */}
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
        </div>
      ))}
    </div>
  );
}
