'use client';

import { Image, Palette } from 'lucide-react';
import { round } from 'lodash';

import { useControlDrawer } from '../hooks/use-control-drawer';
import { Slider } from '@/components/ui/slider';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

type Props = {
  opacity: number;
  setImageOpacity: (opacity: number) => void;
};

export default function Style({ opacity, setImageOpacity }: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const onOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < 0 || value > 100) return;
    setImageOpacity(round(value / 100, 2));
  };
  return (
    <>
      <IconTextButton icon={Image} text="Style" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Image Opacity" icon={Palette} />

          {/* Thickness */}
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
      </BottomDrawer>
    </>
  );
}
