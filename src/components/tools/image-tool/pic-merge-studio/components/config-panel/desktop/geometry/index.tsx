'use client';

import type { ImageConfig } from '../../../../types/config';

import {
  DraftingCompass,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';

import Label from '@/components/common/label';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import CheckBox from '@/components/common/checkbox';

type Props = {
  imageConfig: ImageConfig;
  setGeometry: (key: string, value: number | boolean) => void;
};

export default function Geometry({ imageConfig, setGeometry }: Props) {
  const { angle, scaleX, scaleY, flipX, flipY } = imageConfig;

  const [scaleLocked, setScaleLocked] = useState(true);

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
    <div className="space-y-4">
      <Label
        icon={DraftingCompass}
        className="text-xs !font-black uppercase tracking-widest"
      >
        Geometry
      </Label>

      <div className="space-y-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
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
            <>
              <div className="mt-4 flex items-center justify-between text-left text-xs font-black uppercase">
                <span>Horizontal Scale</span> {(scaleX * 100).toFixed()}%
              </div>
              <Slider
                min={10}
                max={300}
                step={1}
                value={scaleX * 100}
                onChange={(e) => onScaleChange(e, 'X')}
                showBubble={false}
              />
              <div className="mt-4 flex items-center justify-between text-left text-xs font-black uppercase">
                <span>Vertical Scale</span> {(scaleY * 100).toFixed()}%
              </div>
              <Slider
                min={10}
                max={300}
                step={1}
                value={scaleY * 100}
                onChange={(e) => onScaleChange(e, 'Y')}
                showBubble={false}
              />
            </>
          )}
        </div>
        {/* Lock Movement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-left text-xs font-black uppercase">
            <span>Movement</span>
          </div>
          <CheckBox
            options={['Horizontal Lock', 'Vertical Lock']}
            defaultChecked={[
              imageConfig.lockMovementX,
              imageConfig.lockMovementY,
            ]}
            onChange={onMovementLockChange}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-left text-xs font-black uppercase">
            <span>Flip</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
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
  );
}
