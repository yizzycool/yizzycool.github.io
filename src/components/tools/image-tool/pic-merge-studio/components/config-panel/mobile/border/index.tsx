'use client';

import type { CanvasBorder } from '../../../../types/config';

import clsx from 'clsx';
import { Ban, Palette, SquareDashedTopSolid } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import { PresetBorderColors } from '../../data/background';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import ColorPicker from '../color-picker';
import CheckBox from '@/components/common/checkbox';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

import _isUndefined from 'lodash/isUndefined';

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

  const [customColors, setCustomColors] = useState<string[]>([]);

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const colors = useMemo(() => {
    return [...customColors, ...PresetBorderColors];
  }, [customColors]);

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

  // const onOpacityChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const opacity = parseFloat(e.target.value);
  //   if (opacity > 100 || opacity < 0) return;
  //   setBorderColor(color, opacity / 100);
  // };

  const onColorPicked = (color: string) => {
    setBorderColor(color, opacity ?? 1);
    if (colors.includes(color)) return;
    setCustomColors((prev) => [color, ...prev]);
  };

  const onGridOuterBorderSwitched = (_option: string, value: boolean) => {
    setShowOuterBorder(value);
  };

  return (
    <>
      <IconTextButton
        icon={SquareDashedTopSolid}
        text="Border"
        onClick={openDrawer}
      />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Color" icon={Palette} />
          {/* Color */}
          {/* <div>
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
          </div> */}
          <div className="flex max-w-full gap-1 overflow-x-auto pb-4 *:h-[38px] *:w-[38px]">
            {/* Color Picker */}
            <ColorPicker onColorPicked={onColorPicked} />
            {/* Ban */}
            <div className="aspect-square">
              <Button
                variant="ghost"
                rounded="full"
                size="sm"
                bordered
                onClick={resetBorder}
                className={clsx(
                  'aspect-square w-full',
                  'border-2 !p-0 transition-all',
                  isColorActive('') && 'border-sky-500 dark:border-sky-600'
                )}
              >
                <Ban className="h-[34px] w-[34px] rounded-full border-2 border-transparent" />
              </Button>
            </div>
            {/* Preset Colors */}
            {[...customColors, ...PresetBorderColors].map((hex) => (
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
                        'border-sky-500 dark:border-sky-600'
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

          {/* Thickness */}
          <div>
            <div className="flex items-center justify-between text-left text-xs font-black uppercase">
              <span>Thickness</span> {width.toFixed()}
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={width}
              onChange={onThicknessChanged}
              showBubble={false}
            />
          </div>

          {/* Show Outer Border */}
          {!_isUndefined(showOuter) && (
            <div>
              <CheckBox
                options={['Outer Border']}
                optionsDesc={['include outer border']}
                onChange={onGridOuterBorderSwitched}
                defaultChecked={[!!border?.showOuter]}
              />
            </div>
          )}

          {/* TODO: Gradient Color & Background Image */}
        </div>
      </BottomDrawer>
    </>
  );
}
