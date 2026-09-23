'use client';

import type { CanvasBackground } from '../../../types/config';

import { Palette } from 'lucide-react';

import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';

import { PRESET_BACKGROUND_COLORS } from '../../data/background';
import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
import PanelLabel from '../../panel-label';
import ColorSwatch from '../../color-swatch';
import { cn } from '@/utils/cn';

type Props = {
  background: CanvasBackground;
  setBackgroundColor: (color: string, opacity: number) => void;
};

export default function Background({ background, setBackgroundColor }: Props) {
  const { type, color: colorObj } = background;
  const { color, opacity } = colorObj || {};

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

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
    <>
      <IconTextButton icon={Palette} text="Background" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4 pb-6">
          <GroupTitle text="Color" icon={Palette} />

          {/* Pure Colors */}
          <div
            className={cn(
              'no-scrollbar flex w-full gap-2 overflow-x-auto pb-4 pt-2',
              '*:h-[36px] *:w-[36px] *:shrink-0'
            )}
          >
            {/* Color Picker */}
            <ColorPicker
              variant="swatch"
              value={color || '#ffffff'}
              onColorChange={handleColorSelect}
              showTitle={false}
            />
            {/* Preset Colors */}
            {PRESET_BACKGROUND_COLORS.map((hex) => (
              <ColorSwatch
                key={hex}
                color={hex}
                isActive={isColorActive(hex)}
                onClick={handleColorSelect}
                showTitle={false}
              />
            ))}
          </div>

          {/* Opacity */}
          <div>
            <PanelLabel
              badge={
                <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {Math.round((opacity ?? 1) * 100)}%
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

          {/* TODO: Gradient Color & Background Image */}
        </div>
      </BottomDrawer>
    </>
  );
}
