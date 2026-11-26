'use client';

import type { MilestoneState, PosterAspectRatio } from './types';

import { Palette } from 'lucide-react';

import { Tabs } from '@/components/ui/tabs';

import LabelBar from '../../common/label-bar';
import {
  POSTER_RATIO_ICONS,
  POSTER_RATIO_LABELS,
  POSTER_RATIO_TABS,
  POSTER_THEMES,
} from './constants';
import ThemeSwatchItem from './theme-swatch-item';

type Props = {
  state: MilestoneState;
  onUpdate: (patch: Partial<MilestoneState>) => void;
};

/**
 * Poster gradient palette selector and social aspect ratio format switcher.
 */
export default function PosterStyleControls({ state, onUpdate }: Props) {
  return (
    <section aria-labelledby="days-matter-style-heading" className="space-y-3">
      <LabelBar
        id="days-matter-style-heading"
        label="Poster Theme & Format"
        icon={Palette}
      />

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Gradient Palette
          </span>
          <div className="grid grid-cols-2 gap-2">
            {POSTER_THEMES.map((themeItem) => (
              <ThemeSwatchItem
                key={themeItem.id}
                theme={themeItem}
                selected={state.themeId === themeItem.id}
                onSelect={(themeId) => onUpdate({ themeId })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-neutral-200/70 pt-3.5 dark:border-neutral-800/70">
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Export Aspect Ratio
          </span>
          <Tabs<PosterAspectRatio>
            tabs={POSTER_RATIO_TABS}
            activeTab={state.ratio}
            onChange={(ratio) => onUpdate({ ratio })}
            tabLabels={POSTER_RATIO_LABELS}
            tabIcons={POSTER_RATIO_ICONS}
            size="xs"
            variant="segment"
            fullWidth
          />
        </div>
      </div>
    </section>
  );
}
