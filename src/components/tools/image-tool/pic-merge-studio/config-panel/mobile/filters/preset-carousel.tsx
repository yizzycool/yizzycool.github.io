'use client';

import type { PresetFilterType } from '../../../data/fabric-filters';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PRESET_FILTER_TYPES } from '../../../data/fabric-filters';
import PresetItem from './preset-item';

type Props = {
  activePresetTypes: PresetFilterType[];
  onTogglePreset: (type: PresetFilterType) => void;
  onResetPresets: () => void;
};

export default function PresetCarousel({
  activePresetTypes,
  onTogglePreset,
  onResetPresets,
}: Props) {
  const hasActivePresets = activePresetTypes.length > 0;

  return (
    <div className="space-y-3">
      {/* Horizontal Carousel */}
      <div className="no-scrollbar flex max-w-full gap-2.5 overflow-x-auto px-1 py-1">
        {PRESET_FILTER_TYPES.map((type) => (
          <PresetItem
            key={type}
            type={type}
            activePresetTypes={activePresetTypes}
            onToggle={onTogglePreset}
          />
        ))}
      </div>

      {/* Reset Button */}
      <div className="pt-0.5">
        <Button
          variant="outline"
          size="xs"
          icon={RotateCcw}
          onClick={onResetPresets}
          disabled={!hasActivePresets}
          className="w-full text-neutral-600 dark:text-neutral-300"
        >
          Reset Presets
        </Button>
      </div>
    </div>
  );
}
