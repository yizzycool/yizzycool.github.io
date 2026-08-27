'use client';

import type { ToolItem } from './tool-card';

import RevealSection from '../common/reveal-section';
import ToolCard from './tool-card';
import Badge from '../common/badge';

type ToolGroup = {
  id: string;
  name: string;
  items: ToolItem[];
};

type ToolGroupSectionProps = {
  group: ToolGroup;
  isFavorite: (key: string) => boolean;
  onToggleFavorite: (key: string) => void;
};

export default function ToolGroupSection({
  group,
  isFavorite,
  onToggleFavorite,
}: ToolGroupSectionProps) {
  return (
    <RevealSection>
      <section className="space-y-4">
        <div className="flex items-center gap-4 border-b border-neutral-200/60 pb-2 dark:border-neutral-700/80">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {group.name}
          </h2>
          <Badge>{group.items.length}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {group.items.map((item) => (
            <ToolCard
              key={item.key}
              item={item}
              isFavorite={isFavorite(item.key)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
