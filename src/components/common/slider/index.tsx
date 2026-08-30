'use client';

import { Description, Field, Label } from '@headlessui/react';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  title?: string;
  desc?: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  showBubble?: boolean;
  showValueBadge?: boolean;
  unit?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  id?: string;
  className?: string;
};

export default function Slider({
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
}: Props) {
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
          className={cn(
            'h-2 w-full cursor-pointer appearance-none rounded-full outline-none transition-all duration-150',
            // Light/Dark mode CSS variables for track gradient
            '[--slider-fill:#0284c7] [--slider-track:#e2e8f0]',
            'dark:[--slider-fill:#38bdf8] dark:[--slider-track:#334155]',
            // Webkit thumb
            '[&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 dark:[&::-webkit-slider-thumb]:border-sky-400',
            '[&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
            '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125',
            // Moz thumb
            '[&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px]',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-500 dark:[&::-moz-range-thumb]:border-sky-400',
            '[&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.25)]',
            '[&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150',
            '[&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-125'
          )}
        />
      </div>
    </Field>
  );
}
