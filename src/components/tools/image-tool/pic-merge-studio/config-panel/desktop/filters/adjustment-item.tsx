'use client';

import type { AdjustmentFilterConfig } from '../../../data/fabric-filters';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import PanelLabel from '../../panel-label';

type Props = {
  config: AdjustmentFilterConfig;
  value: number;
  onChange: (config: AdjustmentFilterConfig, value: number) => void;
  onReset: (config: AdjustmentFilterConfig) => void;
};

export default function AdjustmentItem({
  config,
  value,
  onChange,
  onReset,
}: Props) {
  const isModified = Math.abs(value - config.neutral) > 0.0001;

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(event.target.value);
    onChange(config, rawVal);
  };

  return (
    <div className="space-y-1">
      <PanelLabel
        icon={config.icon}
        badge={
          isModified ? (
            <Button
              variant="ghost-sky"
              size="xs"
              rounded="md"
              icon={RotateCcw}
              onClick={() => onReset(config)}
              title="Reset to 0"
              tooltipPlacement="top"
              className="!h-auto bg-sky-50 !px-1.5 !py-0.5 font-mono text-[10px] font-semibold dark:bg-sky-950/50"
            >
              {config.format(value)}
            </Button>
          ) : (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              {config.format(value)}
            </span>
          )
        }
      >
        {config.label}
      </PanelLabel>
      <Slider
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={handleSliderChange}
        showBubble={false}
      />
    </div>
  );
}
