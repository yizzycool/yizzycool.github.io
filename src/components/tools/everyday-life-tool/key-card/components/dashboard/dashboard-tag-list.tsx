import { useMemo } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/common/button';
import { SearchHighlight } from '@/components/common/search-highlight';

type DashboardTagListProps = {
  tagsString: string;
  selectedTag: string | null;
  searchQuery: string;
  isCompact?: boolean;
  onTagClick: (e: React.MouseEvent, tag: string) => void;
};

export function DashboardTagList({
  tagsString,
  selectedTag,
  searchQuery,
  isCompact = false,
  onTagClick,
}: DashboardTagListProps) {
  const cleanTags = useMemo(() => {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsString]);

  if (cleanTags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', isCompact ? 'mb-1' : 'mb-3.5')}>
      {cleanTags.map((tag) => (
        <Button
          key={tag}
          variant={selectedTag === tag ? 'primary' : 'ghost-sky'}
          size="xs"
          rounded="md"
          onClick={(e) => onTagClick(e, tag)}
          className={cn(
            'px-1.5 py-0.5 text-[10px]',
            selectedTag !== tag && 'bg-sky-50 dark:bg-sky-950/40'
          )}
        >
          <SearchHighlight text={tag} search={searchQuery} />
        </Button>
      ))}
    </div>
  );
}
