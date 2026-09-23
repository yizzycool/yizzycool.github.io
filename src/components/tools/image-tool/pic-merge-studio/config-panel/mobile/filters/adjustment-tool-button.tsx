'use client';

import type { AdjustmentFilterConfig } from '../../../data/fabric-filters';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

type Props = {
  config: AdjustmentFilterConfig;
  selectedType: string;
  getAdjustmentValue: (config: AdjustmentFilterConfig) => number;
  onSelect: (config: AdjustmentFilterConfig) => void;
};

export default function AdjustmentToolButton({
  config,
  selectedType,
  getAdjustmentValue,
  onSelect,
}: Props) {
  const Icon = config.icon;
  const isSelected = selectedType === config.type;
  const value = getAdjustmentValue(config);
  const isModified = Math.abs(value - config.neutral) > 0.0001;

  return (
    <Button
      variant={isSelected ? 'primary' : 'secondary'}
      size="xs"
      rounded="lg"
      onClick={() => onSelect(config)}
      className={cn(
        'relative shrink-0 flex-col gap-1 !px-2.5 !py-2 text-[11px] font-medium transition-all',
        isSelected
          ? 'shadow-xs ring-2 ring-sky-500/30'
          : 'hover:border-neutral-300 dark:hover:border-neutral-700'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{config.label}</span>

      {isModified && (
        <span
          className={cn(
            'absolute -right-1 -top-1',
            'flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1',
            'shadow-xs border border-white bg-sky-500 text-[8px] font-bold text-white dark:border-neutral-900'
          )}
        >
          {config.format(value)}
        </span>
      )}
    </Button>
  );
}
