'use client';

import clsx from 'clsx';
import { ChangeEvent } from 'react';
import { Description, Field, Label, Select } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

export default function Selector({
  title,
  desc,
  defaultValue,
  options,
  onChange = () => {},
}: {
  title?: string;
  desc?: string;
  defaultValue?: string;
  options: Array<string>;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      {title && (
        <Label className="text-sm/6 font-bold dark:text-white">{title}</Label>
      )}
      {desc && (
        <Description className="mb-3 text-sm/6 opacity-70 dark:text-white/50">
          {desc}
        </Description>
      )}
      <div className="relative">
        <Select
          className={clsx(
            'block w-full appearance-none rounded-lg border px-4 py-2 font-mono text-sm leading-relaxed outline-none',
            'focus:border-transparent focus:ring-2 focus:ring-blue-500',
            'border-gray-200 bg-white text-gray-700 placeholder-gray-400',
            'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500',
            // Make the text of each option black on Windows
            '*:text-black'
          )}
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
        <ChevronDown
          className="group pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
