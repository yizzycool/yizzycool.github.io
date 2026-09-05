import type { CardData } from '../types';

import { useMemo } from 'react';
import { Tag as TagIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/badge';

type TagFilterBarProps = {
  cards: CardData[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

export default function TagFilterBar({
  cards,
  selectedTag,
  onSelectTag,
}: TagFilterBarProps) {
  // Compute unique tags with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    cards.forEach((card) => {
      if (!card.tags) return;
      card.tags.split(',').forEach((t) => {
        const clean = t.trim();
        if (clean) {
          counts.set(clean, (counts.get(clean) || 0) + 1);
        }
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [cards]);

  if (tagCounts.length === 0) return null;

  return (
    <div className="flex max-w-full items-center gap-2 overflow-hidden pb-1 text-xs">
      <div className="flex shrink-0 items-center gap-1.5 pr-1 font-medium text-slate-400 dark:text-slate-500">
        <TagIcon size={13} />
        <span>Tags:</span>
      </div>

      {/* Individual Tags */}
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        {tagCounts.map(({ tag, count }) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'blue' : 'secondary'}
            size="xs"
            rounded="full"
            bordered
            onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
            className="shrink-0 gap-1.5"
          >
            <span>{tag}</span>
            <CountBadge
              count={count}
              variant={selectedTag === tag ? 'subtle-inverted' : 'subtle'}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
