'use client';

import { round } from 'lodash';

import { Slider } from '@/components/ui/slider';

import PanelLabel from '../../panel-label';

type Props = {
  opacity: number;
  setImageOpacity: (opacity: number) => void;
  onChangeEnd?: () => void;
};

export default function Opacity({
  opacity,
  setImageOpacity,
  onChangeEnd,
}: Props) {
  const onOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < 0 || value > 100) return;
    setImageOpacity(round(value / 100, 2));
  };

  return (
    <div className="space-y-4 px-0.5">
      {/* Image Opacity */}
      <div>
        <PanelLabel
          badge={
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {(opacity * 100).toFixed()}%
            </span>
          }
        >
          Opacity
        </PanelLabel>
        <Slider
          min={0}
          max={100}
          step={1}
          value={opacity * 100}
          onChange={onOpacityChange}
          onChangeEnd={onChangeEnd}
          showBubble={false}
        />
      </div>
    </div>
  );
}
