'use client';

import type { CanvasBorder, ImageShadowConfig } from '../../../types/config';

import { isUndefined } from 'lodash';

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  shadow?: ImageShadowConfig;
  setShadow?: (patch: Partial<ImageShadowConfig>) => void;
  onChangeEnd?: () => void;
};

export default function Border({
  border,
  setBorderWidth,
  setBorderColor,
  resetBorder,
  setShowOuterBorder = () => {},
  shadow,
  setShadow,
  onChangeEnd,
}: Props) {
  const { color, opacity, width, showOuter } = border;

  const handlePickerChange = (hex: string) => {
    setBorderColor(hex, opacity ?? 1);
  };

  const handleSwatchSelect = (hex: string) => {
    setBorderColor(hex, opacity ?? 1);
    onChangeEnd?.();
  };

  const isColorActive = (hex: string) => {
    return color === hex;
  };

  const onThicknessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thickness = parseInt(e.target.value);
    if (thickness > 100 || thickness < 0) return;
    setBorderWidth(thickness);
  };

  const onGridOuterBorderSwitched = (value: boolean) => {
    setShowOuterBorder(value);
  };

  return (
    <div className="space-y-4 px-0.5">
      {/* Show Outer Border */}
      {!isUndefined(showOuter) && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Outer Border
          </span>
          <Switch
            size="sm"
            checked={!!border?.showOuter}
            onChange={onGridOuterBorderSwitched}
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
          onChangeEnd={onChangeEnd}
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
            onColorChange={handlePickerChange}
            onChangeEnd={onChangeEnd}
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
              onClick={handleSwatchSelect}
            />
          ))}
        </div>
      </div>

      {/* Drop Shadow (Image Mode) */}
      {shadow && setShadow && (
        <div className="space-y-2.5 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Drop Shadow
            </span>
            <Switch
              size="sm"
              checked={shadow.enabled}
              onChange={(checked) => {
                setShadow({ enabled: checked });
                onChangeEnd?.();
              }}
            />
          </div>
          {shadow.enabled && (
            <div className="space-y-2">
              <Slider
                title="Blur"
                min={0}
                max={60}
                step={1}
                value={shadow.blur}
                showValueBadge
                onChange={(e) => setShadow({ blur: Number(e.target.value) })}
                onChangeEnd={onChangeEnd}
              />
              <Slider
                title="Offset Y"
                min={-30}
                max={40}
                step={1}
                value={shadow.offsetY}
                showValueBadge
                onChange={(e) => setShadow({ offsetY: Number(e.target.value) })}
                onChangeEnd={onChangeEnd}
              />
              <Slider
                title="Opacity"
                min={0.05}
                max={1}
                step={0.05}
                value={shadow.opacity}
                showValueBadge
                onChange={(e) => setShadow({ opacity: Number(e.target.value) })}
                onChangeEnd={onChangeEnd}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
