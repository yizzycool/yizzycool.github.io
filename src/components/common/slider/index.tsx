'use client';

import { Description, Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import _toNumber from 'lodash/toNumber';

type Props = {
  title?: string;
  desc?: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  showBubble?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Slider({
  title,
  desc,
  min,
  max,
  value,
  step = 0.1,
  showBubble = true,
  onChange = () => {},
}: Props) {
  return (
    <Field>
      {title && <Label className="text-sm/6 font-bold">{title}</Label>}
      {desc && (
        <Description className="text-sm/6 text-neutral-500 dark:text-neutral-400">
          {desc}
        </Description>
      )}
      {showBubble && (
        <div className="mx-auto w-fit rounded-md bg-neutral-800/5 px-2 py-1 text-xs dark:bg-white/10">
          {value}
        </div>
      )}
      <input
        className={clsx(
          'mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 dark:bg-neutral-700',
          '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:transition-colors',
          '[&::-webkit-slider-thumb]:hover:bg-blue-600',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500',
          '[&::-moz-range-thumb]:hover:bg-blue-600'
        )}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={onChange}
      />
    </Field>
  );
}
