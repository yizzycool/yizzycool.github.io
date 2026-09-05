'use client';

import type { SliderProps } from './types';

import { Description, Field, Label } from '@headlessui/react';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';
import { sliderThumbBaseStyles } from './slider.variants';

export function Slider({
  title,
  desc,
  min,
  max,
  value,
  step = 0.1,
  showBubble = false,
  showValueBadge = false,
  unit = '',
  onChange = () => {},
  id,
  ariaLabel,
  className,
}: SliderProps) {
  const percentage = useMemo(() => {
    if (max === min) return 0;
    const clamped = Math.min(Math.max(value, min), max);
    return Math.round(((clamped - min) / (max - min)) * 100);
  }, [value, min, max]);

  return (
    <Field className={cn('w-full select-none', className)}>
      {/* Header row: title/desc and value badge */}
      {(title || desc || showValueBadge) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {title && (
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {title}
              </Label>
            )}
            {desc && (
              <Description className="text-xs text-slate-500 dark:text-slate-400">
                {desc}
              </Description>
            )}
          </div>

          {showValueBadge && (
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}

      {showBubble && (
        <div className="mx-auto mb-1 w-fit rounded-md bg-neutral-800/5 px-2 py-0.5 font-mono text-xs dark:bg-white/10">
          {value}
          {unit}
        </div>
      )}

      {/* Modern Dynamic Fill Track & Thumb */}
      <div className="relative flex w-full items-center py-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={onChange}
          aria-label={ariaLabel ?? title ?? desc ?? 'slider'}
          style={{
            background: `linear-gradient(to right, var(--slider-fill, #0284c7) ${percentage}%, var(--slider-track, #e2e8f0) ${percentage}%)`,
          }}
          className={cn(sliderThumbBaseStyles)}
        />
      </div>
    </Field>
  );
}
