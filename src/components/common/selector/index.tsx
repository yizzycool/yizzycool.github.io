'use client';

import { cn } from '@/utils/cn';
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
          className={cn(
            'block w-full appearance-none rounded-xl border px-4 py-2.5 font-mono text-sm leading-relaxed outline-none transition-all duration-200',
            'shadow-2xs border-neutral-200/90 bg-white/80 text-slate-800 backdrop-blur-md',
            'dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100',
            'focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20',
            'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40'
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
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
