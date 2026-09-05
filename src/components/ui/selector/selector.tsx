'use client';

import type { ChangeEvent } from 'react';
import type { SelectorProps } from './types';

import { Description, Field, Label, Select } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/utils/cn';
import { selectorBaseStyles, selectorChevronStyles } from './selector.variants';

export function Selector({
  title,
  desc,
  defaultValue,
  options,
  onChange = () => {},
}: SelectorProps) {
  return (
    <Field>
      {title && (
        <Label className="text-sm/6 font-bold text-slate-700 dark:text-slate-200">
          {title}
        </Label>
      )}
      {desc && (
        <Description className="mb-3 text-sm/6 text-slate-500 dark:text-slate-400">
          {desc}
        </Description>
      )}
      <div className="relative">
        <Select
          className={cn(selectorBaseStyles)}
          defaultValue={defaultValue}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onChange(event.target?.value)
          }
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <ChevronDown className={selectorChevronStyles} aria-hidden="true" />
      </div>
    </Field>
  );
}
