'use client';

import type { ImageConfig } from '../../../../types/config';

import {
  DraftingCompass,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Move,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import CheckBox from '@/components/common/checkbox';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';

type Props = {
  imageConfig: ImageConfig;
  setGeometry: (key: string, value: number | boolean) => void;
};

export default function Geometry({ imageConfig, setGeometry }: Props) {
  const { angle, scaleX, scaleY, flipX, flipY } = imageConfig;

  const [scaleLocked, setScaleLocked] = useState(true);

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const onAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value < 0 || value > 360) return;
    setGeometry('angle', value);
  };

  const onScaleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'XY' | 'X' | 'Y'
  ) => {
    const value = parseInt(e.target.value);
    if (value < 10 || value > 300) return;
    if (type === 'XY') {
      const ratio = scaleY / scaleX;
      setGeometry('scaleX', value / 100);
      setGeometry('scaleY', Math.min(300, Math.max(10, value * ratio)) / 100);
    } else {
      setGeometry(`scale${type}`, value / 100);
    }
  };

  const onMovementLockChange = (option: string, value: boolean) => {
    const key =
      option === 'Horizontal Lock' ? 'lockMovementX' : 'lockMovementY';
    setGeometry(key, value);
  };

  const onFlip = (flip: boolean, type: 'X' | 'Y') => {
    setGeometry(`flip${type}`, flip);
  };

  return (
    <>
      <IconTextButton
        icon={DraftingCompass}
        text="Geometry"
        onClick={openDrawer}
      />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Geometry" icon={DraftingCompass} />

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between text-left text-xs font-black uppercase">
              <span>Rotation</span> {angle.toFixed()}°
            </div>
            <Slider
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={onAngleChange}
              showBubble={false}
            />
          </div>
          {/* Scale X / Y */}
          <div>
            <div className="flex items-center justify-between text-left text-xs font-black uppercase">
              <span>Scale</span>
              {scaleLocked && (
                <div className="flex-1 text-right">
                  {(scaleX * 100).toFixed()}%
                </div>
              )}
              <Button
                variant={scaleLocked ? 'secondary' : 'ghost'}
                size="xs"
                rounded="lg"
                icon={scaleLocked ? Lock : Unlock}
                onClick={() => setScaleLocked((prev) => !prev)}
                className="ml-2 !p-1.5"
              />
            </div>
            {scaleLocked ? (
              <Slider
                min={10}
                max={300}
                step={1}
                value={scaleX * 100}
                onChange={(e) => onScaleChange(e, 'XY')}
                showBubble={false}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mt-4 flex items-center justify-between text-left text-xs font-black uppercase">
                    <span>Horizontal</span> {(scaleX * 100).toFixed()}%
                  </div>
                  <Slider
                    min={10}
                    max={300}
                    step={1}
                    value={scaleX * 100}
                    onChange={(e) => onScaleChange(e, 'X')}
                    showBubble={false}
                  />
                </div>

                <div className="flex-1">
                  <div className="mt-4 flex items-center justify-between text-left text-xs font-black uppercase">
                    <span>Vertical</span> {(scaleY * 100).toFixed()}%
                  </div>
                  <Slider
                    min={10}
                    max={300}
                    step={1}
                    value={scaleY * 100}
                    onChange={(e) => onScaleChange(e, 'Y')}
                    showBubble={false}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex max-w-full space-x-4 overflow-x-auto pb-4">
            {/* Lock Movement */}
            <div className="space-y-4">
              <GroupTitle text="Movement" icon={Move} />
              <CheckBox
                options={['Horizontal Lock', 'Vertical Lock']}
                defaultChecked={[
                  imageConfig.lockMovementX,
                  imageConfig.lockMovementY,
                ]}
                onChange={onMovementLockChange}
                wrapperClassName="!space-y-2"
                labelClassName="whitespace-nowrap *:space-x-2"
              />
            </div>

            {/* Divide */}
            <div className="mb-2 h-[30px] self-end border-l border-neutral-700" />

            <div className="space-y-4">
              <GroupTitle text="Flip" icon={FlipHorizontal} />
              <div className="flex gap-2">
                <Button
                  variant={flipX ? 'primary' : 'secondary'}
                  bordered
                  icon={FlipHorizontal}
                  onClick={() => onFlip(!flipX, 'X')}
                />
                <Button
                  variant={flipY ? 'primary' : 'secondary'}
                  bordered
                  icon={FlipVertical}
                  onClick={() => onFlip(!flipY, 'Y')}
                />
              </div>
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
