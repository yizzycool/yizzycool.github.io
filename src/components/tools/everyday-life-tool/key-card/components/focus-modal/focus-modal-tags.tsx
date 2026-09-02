import { useMemo } from 'react';
import { Badge } from '@/components/common/badge';

type FocusModalTagsProps = {
  tagsString: string;
};

export function FocusModalTags({ tagsString }: FocusModalTagsProps) {
  const cleanTags = useMemo(() => {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsString]);

  if (cleanTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {cleanTags.map((tag) => (
        <Badge key={tag} variant="blue" size="xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
