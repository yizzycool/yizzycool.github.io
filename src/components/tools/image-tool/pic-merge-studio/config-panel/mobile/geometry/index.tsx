'use client';

import type { ImageConfig } from '../../../types/config';

import { useState } from 'react';
import {
  DraftingCompass,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Magnet,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Unlock,
} from 'lucide-react';
import { clamp } from 'lodash';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
import PanelLabel from '../../panel-label';

type Props = {
  imageConfig: ImageConfig;
  setGeometry: (key: string, value: number | boolean) => void;
  setSize: (width: number, height: number) => void;
  resetOriginalSize: () => void;
  resetAspectRatio: () => void;
  onChangeEnd?: () => void;
};

export default function Geometry({
  imageConfig,
  setGeometry,
  setSize,
  resetOriginalSize,
  resetAspectRatio,
  onChangeEnd,
}: Props) {
  const {
    angle,
    snapAngle = 90,
    scaleX,
    scaleY,
    width,
    height,
    flipX,
    flipY,
    lockMovementX,
    lockMovementY,
  } = imageConfig;

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  const isSnapEnabled = snapAngle !== 0;
  const isDeformed = Math.abs(scaleX - scaleY) > 0.005;

  const [isRatioLocked, setIsRatioLocked] = useState(true);
  const [prevSize, setPrevSize] = useState({ width, height });
  const [inputWidth, setInputWidth] = useState<number | ''>(width || '');
  const [inputHeight, setInputHeight] = useState<number | ''>(height || '');

  // Synchronize inputs when external imageConfig updates (canvas scaling, selection)
  if (prevSize.width !== width || prevSize.height !== height) {
    setPrevSize({ width, height });
    setInputWidth(width || '');
    setInputHeight(height || '');
  }

  const onAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value < 0 || value > 360) return;
    setGeometry('angle', value);
  };

  const onToggleSnap = (checked: boolean) => {
    setGeometry('snapAngle', checked ? 90 : 0);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === '') {
      setInputWidth('');
      return;
    }

    const newW = parseInt(valStr, 10);
    if (Number.isNaN(newW)) return;

    setInputWidth(newW);
    if (newW <= 0) return;

    if (isRatioLocked && width > 0 && height > 0) {
      const ratio = height / width;
      const newH = Math.max(1, Math.round(newW * ratio));
      setInputHeight(newH);
      setSize(newW, newH);
    } else {
      const currentH =
        typeof inputHeight === 'number' && inputHeight > 0
          ? inputHeight
          : height;
      setSize(newW, currentH);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === '') {
      setInputHeight('');
      return;
    }

    const newH = parseInt(valStr, 10);
    if (Number.isNaN(newH)) return;

    setInputHeight(newH);
    if (newH <= 0) return;

    if (isRatioLocked && width > 0 && height > 0) {
      const ratio = width / height;
      const newW = Math.max(1, Math.round(newH * ratio));
      setInputWidth(newW);
      setSize(newW, newH);
    } else {
      const currentW =
        typeof inputWidth === 'number' && inputWidth > 0 ? inputWidth : width;
      setSize(currentW, newH);
    }
  };

  const handleBlur = () => {
    const safeW = clamp(
      typeof inputWidth === 'number' ? inputWidth : width,
      1,
      10000
    );
    const safeH = clamp(
      typeof inputHeight === 'number' ? inputHeight : height,
      1,
      10000
    );
    setInputWidth(safeW);
    setInputHeight(safeH);
    if (safeW !== width || safeH !== height) {
      setSize(safeW, safeH);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const onMovementLockChange = (type: 'X' | 'Y', lock: boolean) => {
    setGeometry(`lockMovement${type}`, lock);
  };

  const onFlip = (type: 'X' | 'Y', flip: boolean) => {
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
        <div className="space-y-3.5 p-4">
          <GroupTitle text="Geometry" icon={DraftingCompass} />

          {/* Dimensions (Width / Height) */}
          <div className="space-y-1">
            <PanelLabel
              badge={
                <div className="flex items-center gap-1.5">
                  {isDeformed ? (
                    <Button
                      variant="amber"
                      size="xs"
                      rounded="md"
                      icon={RotateCcw}
                      onClick={resetAspectRatio}
                      title="Aspect ratio is stretched. Click to restore proportional ratio."
                      tooltipPlacement="top"
                      className="!h-auto !px-1.5 !py-0.5 font-mono text-[10px] font-semibold"
                    >
                      {(scaleX * 100).toFixed()}% × {(scaleY * 100).toFixed()}%
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="xs"
                      rounded="md"
                      icon={Math.abs(scaleX - 1) > 0.01 ? RotateCcw : undefined}
                      onClick={resetOriginalSize}
                      title="Click to reset to 100% original resolution"
                      tooltipPlacement="top"
                      className="!h-auto !px-1.5 !py-0.5 font-mono text-[10px] font-semibold"
                    >
                      {(scaleX * 100).toFixed()}%
                    </Button>
                  )}
                </div>
              }
            >
              Dimensions
            </PanelLabel>

            <div className="flex items-end gap-1.5">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <div className="space-y-1">
                  <PanelLabel htmlFor="mobile-image-width">Width</PanelLabel>
                  <Input
                    id="mobile-image-width"
                    type="number"
                    value={inputWidth}
                    placeholder="Width"
                    onChange={handleWidthChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="!px-2.5 !py-1.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <div className="space-y-1">
                  <PanelLabel htmlFor="mobile-image-height">Height</PanelLabel>
                  <Input
                    id="mobile-image-height"
                    type="number"
                    value={inputHeight}
                    placeholder="Height"
                    onChange={handleHeightChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="!px-2.5 !py-1.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              <Button
                variant={isRatioLocked ? 'inverse' : 'ghost'}
                size="sm"
                icon={isRatioLocked ? Lock : Unlock}
                onClick={() => setIsRatioLocked((prev) => !prev)}
                title={
                  isRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'
                }
                tooltipPlacement="top"
                className={cn(
                  'h-[30px] w-[30px] shrink-0 !p-0 transition-all',
                  !isRatioLocked &&
                    'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                )}
              />
            </div>
          </div>

          {/* Rotation & Angle Snap */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <PanelLabel
                badge={
                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {Math.round(angle)}°
                  </span>
                }
              >
                Rotation
              </PanelLabel>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                <Magnet
                  size={13}
                  className={
                    isSnapEnabled ? 'text-sky-500' : 'text-neutral-400'
                  }
                />
                <span>Snap (90°)</span>
                <Switch
                  size="sm"
                  checked={isSnapEnabled}
                  onChange={onToggleSnap}
                />
              </div>
            </div>

            <Slider
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={onAngleChange}
              onChangeEnd={onChangeEnd}
              showBubble={false}
            />
          </div>

          {/* Actions: Flip & Movement Lock in 1 compact row */}
          <div className="space-y-1">
            <PanelLabel>Quick Actions</PanelLabel>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={flipX ? 'primary' : 'secondary'}
                size="xs"
                bordered
                title="Flip Horizontally"
                icon={FlipHorizontal}
                onClick={() => onFlip('X', !flipX)}
                className="w-full !py-1.5"
              />
              <Button
                variant={flipY ? 'primary' : 'secondary'}
                size="xs"
                bordered
                title="Flip Vertically"
                icon={FlipVertical}
                onClick={() => onFlip('Y', !flipY)}
                className="w-full !py-1.5"
              />
              <Button
                variant={lockMovementX ? 'primary' : 'secondary'}
                size="xs"
                bordered
                title="Lock Horizontal Movement"
                icon={MoveHorizontal}
                onClick={() => onMovementLockChange('X', !lockMovementX)}
                className="w-full !py-1.5"
              >
                <Lock className="-ml-1 h-3 w-3" />
              </Button>
              <Button
                variant={lockMovementY ? 'primary' : 'secondary'}
                size="xs"
                bordered
                title="Lock Vertical Movement"
                icon={MoveVertical}
                onClick={() => onMovementLockChange('Y', !lockMovementY)}
                className="w-full !py-1.5"
              >
                <Lock className="-ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
