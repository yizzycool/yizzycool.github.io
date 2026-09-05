import type { CardData } from '../../types';

import { Grid2X2 } from 'lucide-react';
import { motion } from 'motion/react';

import { Switch } from '@/components/ui/switch';

import TagFilterBar from '../tag-filter-bar';
import { DashboardCardItem } from './dashboard-card-item';
import { DashboardEmptyState } from './dashboard-empty-state';

type DashboardProps = {
  allCards: CardData[];
  filteredCards: CardData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  onCardClick: (id: string) => void;
  setMode: (mode: 'dashboard' | 'management') => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
  focusedCardIndex: number;
};

export default function Dashboard({
  allCards,
  filteredCards,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  onCardClick,
  setMode,
  isCompact,
  setIsCompact,
  focusedCardIndex,
}: DashboardProps) {
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
  };

  const hasFilters = Boolean(searchQuery || selectedTag);

  return (
    <div className="space-y-8">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col gap-3">
        <TagFilterBar
          cards={allCards}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        <div className="flex shrink-0 items-center justify-end">
          <div className="shadow-2xs backdrop-blur-xs inline-flex items-center rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-1 transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900/60">
            <Switch
              checked={isCompact}
              onChange={setIsCompact}
              label="Compact"
              icon={Grid2X2}
              size="xs"
              className="gap-2"
              labelClassName="text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredCards.length === 0 ? (
        <DashboardEmptyState
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
          onGoToManagement={() => setMode('management')}
        />
      ) : (
        <motion.div
          layout
          className={
            isCompact
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
              : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {filteredCards.map((card, index) => (
            <motion.div key={card.id} layout className="grid">
              <DashboardCardItem
                key={card.id}
                card={card}
                isFocused={focusedCardIndex === index}
                isCompact={isCompact}
                searchQuery={searchQuery}
                selectedTag={selectedTag}
                onCardClick={onCardClick}
                onTagClick={handleTagClick}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
