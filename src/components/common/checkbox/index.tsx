'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props<T extends readonly string[]> = {
  options: T;
  optionsDesc?: { [K in keyof T]: string };
  defaultChecked?: { [K in keyof T]: boolean };
  theme?: 'base' | 'card' | 'list';
  iconStyle?: 'tick' | 'circle' | 'rounded';
  wrapperClassName?: string;
  labelClassName?: string;
  onChange: (option: T[number], value: boolean) => void;
};

type StrictProps<T extends readonly string[]> = Props<T>;

export default function CheckBox<T extends readonly string[]>({
  options,
  optionsDesc,
  defaultChecked,
  theme = 'base',
  iconStyle = 'tick',
  wrapperClassName = '',
  labelClassName = '',
  onChange,
}: StrictProps<T>) {
  const [checkedList, setCheckedList] = useState<boolean[]>([]);

  // Update checkList status
  useEffect(() => {
    setCheckedList(
      (defaultChecked as boolean[]) ??
        Array.from({ length: options.length }, () => false)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultChecked]);

  const baseWrapperStyles = 'text-left';

  const themeWrappers = {
    base: 'space-y-4',
    card: 'grid grid-cols-1 gap-4',
    list: clsx(
      'overflow-hidden rounded-xl',
      'divide-y divide-neutral-100 dark:divide-neutral-800',
      'border border-neutral-200 dark:border-neutral-700',
      'bg-white dark:bg-neutral-900'
    ),
  };

  const themeLabels = {
    base: 'flex items-center space-x-3 cursor-pointer group',
    card: clsx(
      'relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all overflow-hidden',
      'border-2 border-neutral-200 dark:border-neutral-700',
      'hover:border-neutral-400 dark:hover:border-neutral-600',
      'peer-checked:border-neutral-900 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-900/50'
    ),
    list: clsx(
      'group flex cursor-pointer items-center justify-between p-4',
      'transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
    ),
  };

  const iconStyles = {
    tick: 'rounded checked:bg-neutral-900 dark:checked:bg-white',
    circle: 'rounded-full',
    rounded: 'rounded-md',
  };

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
      className={clsx(
        baseWrapperStyles,
        themeWrappers[theme],
        wrapperClassName
      )}
    >
      {options.map((option, idx) => (
        <label
          key={option + idx}
          className={clsx(themeLabels[theme], labelClassName)}
        >
          <div
            className={clsx(
              theme === 'card'
                ? 'flex flex-row-reverse items-start justify-between'
                : 'flex items-center space-x-4'
            )}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className={clsx(
                  'peer h-5 w-5 cursor-pointer appearance-none transition-all',
                  'border border-neutral-300 dark:border-neutral-700',
                  iconStyles[iconStyle]
                )}
                onChange={() => onOptionChange(idx)}
                checked={!!checkedList[idx]}
              />
              {iconStyle === 'tick' ? (
                <Check
                  className={clsx(
                    'pointer-events-none transition-all',
                    'absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2',
                    'stroke-white opacity-0 peer-checked:opacity-100 dark:stroke-neutral-900'
                  )}
                  strokeWidth={4}
                />
              ) : (
                <div
                  className={clsx(
                    'absolute inset-0 m-1',
                    'bg-neutral-900 dark:bg-neutral-100',
                    'scale-0 transition-transform peer-checked:scale-100',
                    iconStyle === 'circle' ? 'rounded-full' : 'rounded'
                  )}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold group-hover:text-neutral-900 dark:group-hover:text-white">
                {option}
              </span>
              {!!optionsDesc?.[idx] && (
                <span className="mt-1 text-xs text-neutral-500">
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
