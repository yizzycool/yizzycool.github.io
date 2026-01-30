'use client';

import type { CanvasBackground } from '../../../../types/config';

import clsx from 'clsx';
import { Palette } from 'lucide-react';
import { useMemo, useState } from 'react';

import Label from '@/components/common/label';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import ColorPicker from '../color-picker';
import { PresetBackgroundColors } from '../../data/background';

type Props = {
  background: CanvasBackground;
  setBackgroundColor: (color: string, opacity: number) => void;
};

export default function Background({ background, setBackgroundColor }: Props) {
  const { type, color: colorObj } = background;
  const { color, opacity } = colorObj || {};

  const [customColors, setCustomColors] = useState<string[]>([]);

  const colors = useMemo(() => {
    return [...customColors, ...PresetBackgroundColors];
  }, [customColors]);

  const handleColorSelect = (hex: string) => {
    setBackgroundColor(hex, opacity ?? 1);
  };

  const isColorActive = (hex: string) => {
    if (type !== 'color') return false;
    return color === hex;
  };

  const onOpacityChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type !== 'color' || !color) return;
    const opacity = parseFloat(e.target.value);
    if (opacity > 100 || opacity < 0) return;
    setBackgroundColor(color, opacity / 100);
  };

  const onColorPicked = (color: string) => {
    setBackgroundColor(color, opacity ?? 1);
    if (colors.includes(color)) return;
    setCustomColors((prev) => [color, ...prev]);
  };

  return (
    <div className="space-y-4">
      <Label
        icon={Palette}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Background
      </Label>

      {/* Pure Colors */}
      <div className="space-y-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
        <div>
          <div className="flex items-center justify-between text-left text-xs font-black uppercase">
            <span>Opacity</span> {parseInt(((opacity ?? 1) * 100).toString())}
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={parseInt(((opacity ?? 1) * 100).toString())}
            onChange={onOpacityChanged}
            showBubble={false}
          />
        </div>
        <div className="grid grid-cols-8 gap-1">
          {/* Color Picker */}
          <ColorPicker onColorPicked={onColorPicked} />
          {/* Preset Colors */}
          {colors.map((hex) => (
            <div key={hex} className="aspect-square w-full">
              <Button
                variant="ghost"
                rounded="full"
                size="sm"
                bordered
                onClick={() => handleColorSelect(hex)}
                className={clsx(
                  'aspect-square w-full',
                  'border-2 !p-0 transition-all',
                  isColorActive(hex) &&
                    clsx(
                      'text-sky-600 dark:text-sky-600',
                      'border-sky-500 dark:border-sky-600',
                      'bg-sky-100/50 dark:bg-sky-900/50',
                      'hover:bg-sky-100/50 hover:dark:bg-sky-900/50'
                    )
                )}
              >
                <div
                  className="aspect-square w-[calc(100%_-_4px)] rounded-full border-2 border-transparent"
                  style={{ backgroundColor: hex }}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* TODO: Gradient Color & Background Image */}
    </div>
  );
}
