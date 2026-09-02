import type { ToolItem } from './tool-card';

import { Star } from 'lucide-react';

import { Badge } from '@/components/common/badge';
import ToolCard from './tool-card';
import RevealSection from '../common/reveal-section';

type FavoritesSectionProps = {
  favoriteTools: ToolItem[];
  onToggleFavorite: (key: string) => void;
};

export default function FavoritesSection({
  favoriteTools,
  onToggleFavorite,
}: FavoritesSectionProps) {
  if (favoriteTools.length === 0) {
    return null;
  }

  return (
    <RevealSection>
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-2 dark:border-neutral-700/80">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Favorite Tools
          </h2>
          <Badge variant="amber">{favoriteTools.length}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favoriteTools.map((tool) => (
            <ToolCard
              key={tool.key}
              item={tool}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
