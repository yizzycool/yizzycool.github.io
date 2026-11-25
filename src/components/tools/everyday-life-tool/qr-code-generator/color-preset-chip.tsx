'use client';

import type { ColorPresetItem } from './appearance';

import { Chip } from '@/components/ui/chip';

type Props = {
  preset: ColorPresetItem;
  isSelected: boolean;
  onSelect: (fg: string, bg: string) => void;
};

/**
 * Curated QR code color palette chip.
 */
export default function ColorPresetChip({
  preset,
  isSelected,
  onSelect,
}: Props) {
  return (
    <Chip
      selected={isSelected}
      onClick={() => onSelect(preset.fg, preset.bg)}
      title={`${preset.name} (FG: ${preset.fg}, BG: ${preset.bg})`}
      showCheck
    >
      <span
        className="shadow-2xs h-3.5 w-3.5 shrink-0 rounded-full border border-neutral-300/80 dark:border-neutral-600"
        style={{
          background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
        }}
      />
      <span>{preset.name}</span>
    </Chip>
  );
}
