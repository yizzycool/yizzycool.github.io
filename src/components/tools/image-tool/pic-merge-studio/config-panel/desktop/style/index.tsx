'use client';

import { Image } from 'lucide-react';
import { round } from 'lodash';

import Label from '@/components/common/label';
import Slider from '@/components/common/slider';

type Props = {
  opacity: number;
  setImageOpacity: (opacity: number) => void;
};

export default function Style({ opacity, setImageOpacity }: Props) {
  const onOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < 0 || value > 100) return;
    setImageOpacity(round(value / 100, 2));
  };

  return (
    <div className="space-y-4">
      <Label
        icon={Image}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Image Style
      </Label>

      <div className="space-y-4 rounded-xl bg-white/40 p-4 dark:bg-neutral-900/40">
        {/* Image Opacity */}
        <div>
          <div className="mb-2 flex items-center justify-between text-left text-xs font-black uppercase">
            <span>Opacity</span> {(opacity * 100).toFixed()}
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={opacity * 100}
            onChange={onOpacityChange}
            showBubble={false}
          />
        </div>
      </div>
    </div>
  );
}
