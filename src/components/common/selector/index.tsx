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
        <Label className="text-sm/6 font-medium text-white">{title}</Label>
      )}
      {desc && (
        <Description className="text-sm/6 text-white/50">{desc}</Description>
      )}
      <div className="relative">
        <Select
          className={clsx(
            'mt-3 block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
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
          className="group pointer-events-none absolute right-2.5 top-2.5 size-4"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
