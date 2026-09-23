'use client';

import type { CanvasBackground } from '../../../types/config';

import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';

import { PRESET_BACKGROUND_COLORS } from '../../data/background';
import PanelLabel from '../../panel-label';
import ColorSwatch from '../../color-swatch';

type Props = {
  background: CanvasBackground;
  setBackgroundColor: (color: string, opacity: number) => void;
};

export default function Background({ background, setBackgroundColor }: Props) {
  const { type, color: colorObj } = background;
  const { color, opacity } = colorObj || {};

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

  return (
    <div className="space-y-4 px-0.5">
      <div>
        <PanelLabel
          badge={
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {parseInt(((opacity ?? 1) * 100).toString())}%
            </span>
          }
        >
          Opacity
        </PanelLabel>
        <Slider
          min={0}
          max={100}
          step={1}
          value={parseInt(((opacity ?? 1) * 100).toString())}
          onChange={onOpacityChanged}
          showBubble={false}
        />
      </div>

      <div>
        <PanelLabel className="mb-2">Colors</PanelLabel>
        <div className="grid grid-cols-7 gap-1.5">
          {/* Color Picker */}
          <ColorPicker
            variant="swatch"
            value={color || '#ffffff'}
            onColorChange={handleColorSelect}
          />
          {/* Preset Colors */}
          {PRESET_BACKGROUND_COLORS.map((hex) => (
            <ColorSwatch
              key={hex}
              color={hex}
              isActive={isColorActive(hex)}
              onClick={handleColorSelect}
            />
          ))}
        </div>
      </div>

      {/* TODO: Gradient Color & Background Image */}
    </div>
  );
}
