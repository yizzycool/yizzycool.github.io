'use client';

import type { ImageConfig } from '../../../types/config';

import { useState } from 'react';
import {
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
    <div className="space-y-4 px-0.5">
      {/* Angle Snap */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <Magnet
            size={14}
            className={isSnapEnabled ? 'text-sky-500' : 'text-neutral-400'}
          />
          <span>Angle Snap (90°)</span>
        </div>
        <Switch size="sm" checked={isSnapEnabled} onChange={onToggleSnap} />
      </div>

      {/* Rotation */}
      <div>
        <PanelLabel
          badge={
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {angle.toFixed()}°
            </span>
          }
        >
          Rotation
        </PanelLabel>
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

      {/* Dimensions (Width / Height) */}
      <div className="space-y-1.5">
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
              <PanelLabel htmlFor="image-dimension-width">Width</PanelLabel>
              <Input
                id="image-dimension-width"
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
              <PanelLabel htmlFor="image-dimension-height">Height</PanelLabel>
              <Input
                id="image-dimension-height"
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
            title={isRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            tooltipPlacement="top"
            className={cn(
              'h-[30px] w-[30px] shrink-0 !p-0 transition-all',
              !isRatioLocked &&
                'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
            )}
          />
        </div>
      </div>

      {/* Movement Lock */}
      <div className="space-y-2">
        <PanelLabel>Movement Lock</PanelLabel>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={lockMovementX ? 'primary' : 'secondary'}
            bordered
            title="Lock Horizontal Movement"
            icon={MoveHorizontal}
            onClick={() => onMovementLockChange('X', !lockMovementX)}
            className="relative"
          >
            <Lock className="-ml-2 h-4 w-4" />
          </Button>
          <Button
            variant={lockMovementY ? 'primary' : 'secondary'}
            bordered
            title="Lock Vertical Movement"
            icon={MoveVertical}
            onClick={() => onMovementLockChange('Y', !lockMovementY)}
          >
            <Lock className="-ml-3 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flip */}
      <div className="space-y-2">
        <PanelLabel>Flip Direction</PanelLabel>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={flipX ? 'primary' : 'secondary'}
            bordered
            title="Flip Horizontally"
            icon={FlipHorizontal}
            onClick={() => onFlip('X', !flipX)}
          />
          <Button
            variant={flipY ? 'primary' : 'secondary'}
            bordered
            title="Flip Vertically"
            icon={FlipVertical}
            onClick={() => onFlip('Y', !flipY)}
          />
        </div>
      </div>
    </div>
  );
}
