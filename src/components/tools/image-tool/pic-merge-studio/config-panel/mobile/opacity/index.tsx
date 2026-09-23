'use client';

import { Palette, Sliders } from 'lucide-react';
import { round } from 'lodash';

import { useControlDrawer } from '../hooks/use-control-drawer';
import { Slider } from '@/components/ui/slider';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

import PanelLabel from '../../panel-label';

type Props = {
  opacity: number;
  setImageOpacity: (opacity: number) => void;
};

export default function Opacity({ opacity, setImageOpacity }: Props) {
  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const onOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < 0 || value > 100) return;
    setImageOpacity(round(value / 100, 2));
  };
  return (
    <>
      <IconTextButton icon={Sliders} text="Opacity" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Image Opacity" icon={Palette} />

          {/* Opacity */}
          <div>
            <PanelLabel
              badge={
                <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {Math.round(opacity * 100)}%
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
              showBubble={false}
            />
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
