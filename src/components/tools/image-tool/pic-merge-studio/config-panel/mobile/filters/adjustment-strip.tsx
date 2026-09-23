'use client';

import type { AdjustmentFilterConfig } from '../../../data/fabric-filters';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import PanelLabel from '../../panel-label';
import { ADJUSTMENT_FILTER_CONFIGS } from '../../../data/fabric-filters';
import AdjustmentToolButton from './adjustment-tool-button';

type Props = {
  getAdjustmentValue: (config: AdjustmentFilterConfig) => number;
  onAdjustmentChange: (config: AdjustmentFilterConfig, value: number) => void;
  onResetAdjustment: (config: AdjustmentFilterConfig) => void;
  onResetAllAdjustments: () => void;
  hasActiveAdjustments: boolean;
};

export default function AdjustmentStrip({
  getAdjustmentValue,
  onAdjustmentChange,
  onResetAdjustment,
  onResetAllAdjustments,
  hasActiveAdjustments,
}: Props) {
  const [selectedConfig, setSelectedConfig] = useState<AdjustmentFilterConfig>(
    ADJUSTMENT_FILTER_CONFIGS[0]
  );

  const currentValue = getAdjustmentValue(selectedConfig);
  const isCurrentModified =
    Math.abs(currentValue - selectedConfig.neutral) > 0.0001;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    onAdjustmentChange(selectedConfig, rawVal);
  };

  return (
    <div className="space-y-3">
      {/* Horizontal Tool Strip */}
      <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto px-1 py-1">
        {ADJUSTMENT_FILTER_CONFIGS.map((config) => (
          <AdjustmentToolButton
            key={config.type}
            config={config}
            selectedType={selectedConfig.type}
            getAdjustmentValue={getAdjustmentValue}
            onSelect={setSelectedConfig}
          />
        ))}
      </div>

      {/* Active Adjustment Slider */}
      <div className="space-y-1.5 rounded-xl bg-neutral-50/80 p-2.5 dark:bg-neutral-800/40">
        <PanelLabel
          icon={selectedConfig.icon}
          badge={
            isCurrentModified ? (
              <Button
                variant="ghost-sky"
                size="xs"
                rounded="md"
                icon={RotateCcw}
                onClick={() => onResetAdjustment(selectedConfig)}
                title="Reset to 0"
                tooltipPlacement="top"
                className="!h-auto bg-sky-50 !px-1.5 !py-0.5 font-mono text-[10px] font-semibold dark:bg-sky-950/50"
              >
                {selectedConfig.format(currentValue)}
              </Button>
            ) : (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                {selectedConfig.format(currentValue)}
              </span>
            )
          }
        >
          {selectedConfig.label}
        </PanelLabel>

        <Slider
          min={selectedConfig.min}
          max={selectedConfig.max}
          step={selectedConfig.step}
          value={currentValue}
          onChange={handleSliderChange}
          showBubble={false}
        />
      </div>

      {/* Reset All Button */}
      <div className="pt-0.5">
        <Button
          variant="outline"
          size="xs"
          icon={RotateCcw}
          onClick={onResetAllAdjustments}
          disabled={!hasActiveAdjustments}
          className="w-full text-neutral-600 dark:text-neutral-300"
        >
          Reset Adjustments
        </Button>
      </div>
    </div>
  );
}
