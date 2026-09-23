'use client';

import type { CanvasBorder } from '../../../types/config';

import { isUndefined } from 'lodash';

import { Slider } from '@/components/ui/slider';
import { CheckBox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';

import { PRESET_BORDER_COLORS } from '../../data/background';
import PanelLabel from '../../panel-label';
import ColorSwatch from '../../color-swatch';

type Props = {
  border: CanvasBorder & { showOuter?: boolean };
  setBorderWidth: (strokeWidth: number) => void;
  setBorderColor: (color: string, opacity: number) => void;
  resetBorder: () => void;
  setShowOuterBorder?: (show: boolean) => void; // For Grid layout
};

export default function Border({
  border,
  setBorderWidth,
  setBorderColor,
  resetBorder,
  setShowOuterBorder = () => {},
}: Props) {
  const { color, opacity, width, showOuter } = border;

  const handleColorSelect = (hex: string) => {
    setBorderColor(hex, opacity ?? 1);
  };

  const isColorActive = (hex: string) => {
    return color === hex;
  };

  const onThicknessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thickness = parseInt(e.target.value);
    if (thickness > 100 || thickness < 0) return;
    setBorderWidth(thickness);
  };

  const onGridOuterBorderSwitched = (_option: string, value: boolean) => {
    setShowOuterBorder(value);
  };

  return (
    <div className="space-y-4 px-0.5">
      {/* Show Outer Border */}
      {!isUndefined(showOuter) && (
        <div>
          <CheckBox
            options={['Outer Border']}
            optionsDesc={['include outer border']}
            onChange={onGridOuterBorderSwitched}
            defaultChecked={[!!border?.showOuter]}
          />
        </div>
      )}
      {/* Thickness */}
      <div>
        <PanelLabel
          badge={
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {width.toFixed()}px
            </span>
          }
        >
          Thickness
        </PanelLabel>
        <Slider
          min={0}
          max={100}
          step={1}
          value={width}
          onChange={onThicknessChanged}
          showBubble={false}
        />
      </div>

      <div>
        <PanelLabel className="mb-2">Border Color</PanelLabel>
        <div className="grid grid-cols-7 gap-1.5">
          {/* Color Picker */}
          <ColorPicker
            variant="swatch"
            value={color || '#000000'}
            onColorChange={handleColorSelect}
          />
          {/* Ban */}
          <ColorSwatch
            color=""
            isBan
            title="No Border"
            isActive={isColorActive('')}
            onClick={resetBorder}
          />
          {/* Preset Colors */}
          {PRESET_BORDER_COLORS.map((hex) => (
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
