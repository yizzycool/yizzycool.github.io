'use client';

import type { CanvasSize } from '../../../../types/config';

import clsx from 'clsx';
import { Check, Move, Proportions } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useControlDrawer } from '../hooks/use-control-drawer';
import usePreventNumberWheel from '@/hooks/dom/use-prevent-number-wheel';
import Button from '@/components/common/button';
import IconTextButton from '../icon-text-button';
import BottomDrawer from '../bottom-drawer';
import GroupTitle from '../group-title';
import { DefaultCanvasConfig } from '../../../..';
import {
  PresetAspectRatios,
  type ConfitRatioType,
} from '../../data/aspect-ratio';

import _clamp from 'lodash/clamp';

const MobilePresetAspectRatios: ConfitRatioType[] = [
  {
    title: 'Custom',
    desc: 'Custom Size',
    isCustom: true,
  } as ConfitRatioType,
  ...PresetAspectRatios.slice(0, PresetAspectRatios.length - 1),
];

const MIN_SIZE = 512;
const MAX_SIZE = 4096;
const CustomSizes: Array<{ key: 'width' | 'height'; label: string }> = [
  {
    key: 'width',
    label: 'Width (px)',
  },
  {
    key: 'height',
    label: 'Height (px)',
  },
];

type Props = {
  size: CanvasSize;
  setSize: (width: number, height: number) => void;
};

export default function AspectRatio({ size, setSize }: Props) {
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [inputSize, setInputSize] = useState<CanvasSize>(
    DefaultCanvasConfig.size
  );

  const refCallback = usePreventNumberWheel();

  const { isOpen, openDrawer, closeDrawer } = useControlDrawer();

  // Sync inputSize with canvasSize
  useEffect(() => {
    if (size.width === inputSize.width && size.height === inputSize.height)
      return;

    setInputSize(size);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const handleRatioSelect = (ratio: ConfitRatioType) => {
    if (ratio.title === 'Custom') {
      setIsCustomSize(true);
    } else if (ratio.width && ratio.height) {
      setIsCustomSize(false);
      setSize(ratio.width, ratio.height);
    }
  };

  const handleCustomSize = (key: 'width' | 'height', value: string) => {
    setInputSize((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    clampValue();
  };

  const handleBlur = () => {
    clampValue();
  };

  const clampValue = () => {
    const width = _clamp(inputSize.width, MIN_SIZE, MAX_SIZE);
    const height = _clamp(inputSize.height, MIN_SIZE, MAX_SIZE);
    setInputSize({ width, height });
  };

  const handleApply = () => {
    if (!isCustomSize) return;
    setSize(inputSize.width, inputSize.height);
  };

  const isRatioActive = (ratio: ConfitRatioType) => {
    if (isCustomSize) {
      return ratio.title === 'Custom';
    } else {
      return size.width === ratio.width && size.height === ratio.height;
    }
  };

  return (
    <>
      <IconTextButton icon={Proportions} text="Size" onClick={openDrawer} />

      <BottomDrawer isOpen={isOpen} onClose={closeDrawer}>
        <div className="space-y-4 p-4">
          <GroupTitle text="Size" icon={Proportions} />

          <div className="flex max-w-full gap-3 overflow-x-auto pb-4">
            {MobilePresetAspectRatios.map((ratio) => (
              <Button
                key={ratio.title}
                variant="ghost"
                rounded="base"
                size="sm"
                bordered
                onClick={() => handleRatioSelect(ratio)}
                className={clsx(
                  'flex-col gap-2',
                  isRatioActive(ratio) &&
                    clsx(
                      'text-sky-600 dark:text-sky-600',
                      'border-sky-500 dark:border-sky-600',
                      'bg-sky-100/50 dark:bg-sky-900/50',
                      'hover:bg-sky-100/50 hover:dark:bg-sky-900/50'
                    )
                )}
              >
                {ratio.isCustom ? (
                  <Move
                    size={20}
                    className={
                      isRatioActive(ratio) ? 'opacity-100' : 'opacity-30'
                    }
                  />
                ) : ratio.width && ratio.height ? (
                  <div
                    className={clsx(
                      'h-[20px] border transition-all duration-200',
                      isRatioActive(ratio)
                        ? clsx(
                            'border-sky-500 dark:border-sky-600',
                            'bg-sky-100/50 dark:bg-sky-900/50'
                          )
                        : clsx(
                            'border-neutral-400 dark:border-neutral-500',
                            'bg-neutral-100/50 dark:bg-neutral-800/50'
                          )
                      // ratio.width < ratio.height ? 'h-[30px]' : 'w-[30px]'
                    )}
                    style={{
                      aspectRatio: `${ratio.width / (ratio.height || 1)}`,
                    }}
                  ></div>
                ) : null}
                <div>
                  <p className="text-xs font-black">{ratio.title}</p>
                  <p className="whitespace-nowrap font-mono text-xs tracking-tighter">
                    {ratio.desc
                      ? ratio.desc
                      : `${ratio.width} x ${ratio.height}`}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom Inputs */}
          <div
            className={clsx(
              'space-y-4 transition-all duration-500',
              !isCustomSize && 'opacity-30'
            )}
          >
            <GroupTitle text="Custom Size" icon={Move} />
            <div className="flex items-end gap-4 text-left">
              {CustomSizes.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label
                    htmlFor={`size-${key}`}
                    className="block pl-1 text-xs font-bold uppercase tracking-widest text-neutral-400"
                  >
                    {label}
                  </label>
                  <input
                    ref={refCallback}
                    id={`size-${key}`}
                    type="number"
                    value={inputSize[key] || ''}
                    onChange={(e) => handleCustomSize(key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className={clsx(
                      'm-0 w-full',
                      'rounded-lg outline-none focus:ring-2 focus:ring-blue-500',
                      'px-4 py-2 text-sm font-bold transition-all',
                      'bg-transparent backdrop-blur',
                      'border border-neutral-500/20 text-neutral-600 dark:text-neutral-400',
                      !isCustomSize && 'cursor-not-allowed'
                    )}
                    disabled={!isCustomSize}
                  />
                </div>
              ))}
              <div>
                <Button
                  variant="primary"
                  rounded="full"
                  size="sm"
                  icon={Check}
                  onClick={handleApply}
                  disabled={!isCustomSize}
                />
              </div>
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  );
}
