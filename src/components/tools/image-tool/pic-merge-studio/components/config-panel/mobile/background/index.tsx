'use client';

import type { CanvasBackground } from '../../../../types/config';

import clsx from 'clsx';
import { Palette } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import { PresetBackgroundColors } from '../../data/background';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import ColorPicker from '../color-picker';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

type Props = {
  background: CanvasBackground;
  setBackgroundColor: (color: string, opacity: number) => void;
};

export default function Background({ background, setBackgroundColor }: Props) {
  const { type, color: colorObj } = background;
  const { color, opacity } = colorObj || {};

  const [customColors, setCustomColors] = useState<string[]>([]);

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

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
    <>
      <IconTextButton icon={Palette} text="Background" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Color" icon={Palette} />

          {/* Pure Colors */}
          <div className="flex max-w-full gap-1 overflow-x-auto pb-4 *:h-[38px] *:w-[38px]">
            {/* Color Picker */}
            <ColorPicker onColorPicked={onColorPicked} />
            {/* Preset Colors */}
            {colors.map((hex) => (
              <div key={hex} className="aspect-square">
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

          {/* Opacity */}
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

          {/* TODO: Gradient Color & Background Image */}
        </div>
      </BottomDrawer>
    </>
  );
}
