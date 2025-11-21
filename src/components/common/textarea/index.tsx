'use client';

import clsx from 'clsx';
import { Description, Field, Label, Textarea as TA } from '@headlessui/react';
import { ChangeEvent } from 'react';

export default function Textarea({
  title,
  desc,
  id,
  value,
  readOnly,
  rows = 3,
  placeholder = '',
  onChange = () => {},
}: {
  title?: string;
  desc?: string;
  id?: string;
  value?: string;
  readOnly?: boolean;
  rows?: number;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <Field className="w-full">
      {title && (
        <Label className="text-sm/6 font-bold dark:text-white">{title}</Label>
      )}
      {desc && (
        <Description className="mb-3 text-sm/6 opacity-70 dark:text-white/50">
          {desc}
        </Description>
      )}
      <TA
        className={clsx(
          'w-full resize-none rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed outline-none',
          'focus:border-transparent focus:ring-2 focus:ring-blue-500',
          'border-gray-200 bg-white text-gray-700 placeholder-gray-400',
          'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500'
        )}
        rows={rows}
        id={id}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange(e)}
      />
    </Field>
  );
}
