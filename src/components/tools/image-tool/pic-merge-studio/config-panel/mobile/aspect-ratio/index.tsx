'use client';

import type { CanvasSize } from '../../../types/config';
import type { SelectorOptionItem } from '@/components/ui/selector';

import { Lock, Proportions, Unlock } from 'lucide-react';
import { useState } from 'react';
import { clamp } from 'lodash';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Selector } from '@/components/ui/selector';

import { useControlDrawer } from '../hooks/use-control-drawer';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
import PanelLabel from '../../panel-label';

const MIN_SIZE = 1;
const MAX_SIZE = 4096;

const PRESET_OPTIONS: SelectorOptionItem[] = [
  { label: 'Custom Dimensions', value: 'custom' },
  { label: '1:1 Square (1080 × 1080)', value: '1080x1080' },
  { label: '4:5 IG Portrait (1080 × 1350)', value: '1080x1350' },
  { label: '9:16 Story / Reel (1080 × 1920)', value: '1080x1920' },
  { label: '16:9 Landscape (1920 × 1080)', value: '1920x1080' },
  { label: '4:3 Standard (1440 × 1080)', value: '1440x1080' },
  { label: '3:4 Portrait (1080 × 1440)', value: '1080x1440' },
  { label: '3:2 Photo Landscape (1620 × 1080)', value: '1620x1080' },
  { label: '2:3 Photo Portrait (1080 × 1620)', value: '1080x1620' },
  { label: 'A4 Document (2480 × 3508)', value: '2480x3508' },
];

const DIMENSION_FIELDS = [
  { key: 'width', label: 'Width', placeholder: 'Width' },
  { key: 'height', label: 'Height', placeholder: 'Height' },
] as const;

type Props = {
  size: CanvasSize;
  setSize: (width: number, height: number) => void;
};

export default function AspectRatio({ size, setSize }: Props) {
  const [prevSize, setPrevSize] = useState(size);
  const [inputSize, setInputSize] = useState<CanvasSize>(size);
  const [isLocked, setIsLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(
    size.width / (size.height || 1)
  );

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  if (prevSize.width !== size.width || prevSize.height !== size.height) {
    setPrevSize(size);
    setInputSize(size);
    if (size.width > 0 && size.height > 0) {
      setAspectRatio(size.width / size.height);
    }
  }

  const isApplyDisabled =
    size.width === inputSize.width && size.height === inputSize.height;

  const currentPresetValue = `${inputSize.width}x${inputSize.height}`;
  const isMatchedPreset = PRESET_OPTIONS.some(
    (opt) => opt.value === currentPresetValue
  );
  const selectedPreset = isMatchedPreset ? currentPresetValue : 'custom';

  const handlePresetChange = (val: string) => {
    if (val === 'custom') {
      document.getElementById('mobile-canvas-width')?.focus();
      return;
    }

    const parts = val.split('x');
    const w = parseInt(parts[0], 10);
    const h = parseInt(parts[1], 10);
    if (!isNaN(w) && !isNaN(h)) {
      setAspectRatio(w / (h || 1));
      setInputSize({ width: w, height: h });
    }
  };

  const handleCustomSize = (key: 'width' | 'height', value: string) => {
    const num = parseInt(value, 10);
    const safeNum = isNaN(num) ? 0 : num;

    if (isLocked && safeNum > 0 && aspectRatio > 0) {
      if (key === 'width') {
        const calculatedHeight = Math.round(safeNum / aspectRatio);
        setInputSize({ width: safeNum, height: calculatedHeight });
      } else {
        const calculatedWidth = Math.round(safeNum * aspectRatio);
        setInputSize({ width: calculatedWidth, height: safeNum });
      }
    } else {
      setInputSize((prev) => {
        const updated = { ...prev, [key]: safeNum };
        if (updated.width > 0 && updated.height > 0) {
          setAspectRatio(updated.width / updated.height);
        }
        return updated;
      });
    }
  };

  const toggleLock = () => {
    setIsLocked((prev) => {
      const next = !prev;
      if (next && inputSize.width > 0 && inputSize.height > 0) {
        setAspectRatio(inputSize.width / inputSize.height);
      }
      return next;
    });
  };

  const handleApply = () => {
    const width = clamp(inputSize.width || MIN_SIZE, MIN_SIZE, MAX_SIZE);
    const height = clamp(inputSize.height || MIN_SIZE, MIN_SIZE, MAX_SIZE);
    setInputSize({ width, height });
    if (size.width === width && size.height === height) {
      return;
    }
    setSize(width, height);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const handleBlur = () => {
    const width = clamp(inputSize.width || MIN_SIZE, MIN_SIZE, MAX_SIZE);
    const height = clamp(inputSize.height || MIN_SIZE, MIN_SIZE, MAX_SIZE);
    setInputSize({ width, height });
  };

  return (
    <>
      <IconTextButton icon={Proportions} text="Size" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Size" icon={Proportions} />

          {/* Dimension Inputs */}
          <div className="flex items-end gap-1.5">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {DIMENSION_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <PanelLabel htmlFor={`mobile-canvas-${key}`}>
                    {label}
                  </PanelLabel>
                  <Input
                    id={`mobile-canvas-${key}`}
                    type="number"
                    value={inputSize[key] === 0 ? '' : inputSize[key]}
                    placeholder={placeholder}
                    onChange={(e) => handleCustomSize(key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="!px-2.5 !py-1.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              ))}
            </div>
            <Button
              variant={isLocked ? 'inverse' : 'ghost'}
              size="sm"
              icon={isLocked ? Lock : Unlock}
              onClick={toggleLock}
              title={isLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              tooltipPlacement="top"
              className={cn(
                'h-[30px] w-[30px] shrink-0 !p-0 transition-all',
                !isLocked &&
                  'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
              )}
            />
          </div>

          {/* Preset Templates */}
          <div className="space-y-1.5">
            <PanelLabel>Preset Templates</PanelLabel>
            <Selector
              size="sm"
              options={PRESET_OPTIONS}
              value={selectedPreset}
              onChange={handlePresetChange}
              placeholder="Choose a template..."
              className="w-full text-xs font-medium"
            />
          </div>

          {/* Apply Button & Info */}
          <div className="space-y-2 pt-1">
            <Button
              variant="primary"
              size="xs"
              className="w-full font-medium"
              onClick={handleApply}
              disabled={isApplyDisabled}
            >
              {isApplyDisabled ? 'Size Applied' : 'Apply Dimensions'}
            </Button>
            <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500">
              Range: {MIN_SIZE} ~ {MAX_SIZE} px
            </p>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
