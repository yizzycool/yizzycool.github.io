'use client';

import type { CheckboxProps } from './types';

import { Check } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';
import {
  checkboxBaseWrapperStyles,
  checkboxIconStyles,
  checkboxThemeLabels,
  checkboxThemeWrappers,
} from './checkbox.variants';

export function Checkbox<T extends readonly string[]>({
  options,
  optionsDesc,
  defaultChecked,
  theme = 'base',
  iconStyle = 'tick',
  wrapperClassName = '',
  labelClassName = '',
  onChange,
}: CheckboxProps<T>) {
  const initialList =
    (defaultChecked as boolean[]) ??
    Array.from({ length: options.length }, () => false);

  const [prevDefaultChecked, setPrevDefaultChecked] = useState(defaultChecked);
  const [checkedList, setCheckedList] = useState<boolean[]>(initialList);

  if (prevDefaultChecked !== defaultChecked) {
    setPrevDefaultChecked(defaultChecked);
    setCheckedList(initialList);
  }

  const onOptionChange = (idx: number) => {
    onChange(options[idx], !checkedList[idx]);
    setCheckedList((prev) => [
      ...prev.slice(0, idx),
      !prev[idx],
      ...prev.slice(idx + 1),
    ]);
  };

  return (
    <div
      className={cn(
        checkboxBaseWrapperStyles,
        checkboxThemeWrappers[theme],
        wrapperClassName
      )}
    >
      {options.map((option, idx) => (
        <label
          key={option + idx}
          className={cn(checkboxThemeLabels[theme], labelClassName)}
        >
          <div
            className={cn(
              theme === 'card'
                ? 'flex flex-row-reverse items-start justify-between'
                : 'flex items-center space-x-4'
            )}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className={cn(
                  'peer h-5 w-5 cursor-pointer appearance-none transition-all',
                  'border border-neutral-300 dark:border-neutral-700',
                  checkboxIconStyles[iconStyle]
                )}
                onChange={() => onOptionChange(idx)}
                checked={!!checkedList[idx]}
              />
              {iconStyle === 'tick' ? (
                <Check
                  className={cn(
                    'pointer-events-none transition-all',
                    'absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2',
                    'stroke-white opacity-0 peer-checked:opacity-100 dark:stroke-neutral-900'
                  )}
                  strokeWidth={4}
                />
              ) : (
                <div
                  className={cn(
                    'absolute inset-0 m-1',
                    'bg-neutral-900 dark:bg-neutral-100',
                    'scale-0 transition-transform peer-checked:scale-100',
                    iconStyle === 'circle' ? 'rounded-full' : 'rounded'
                  )}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold group-hover:text-slate-900 dark:group-hover:text-white">
                {option}
              </span>
              {!!optionsDesc?.[idx] && (
                <span className="mt-1 text-xs text-slate-500">
                  {optionsDesc[idx]}
                </span>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
