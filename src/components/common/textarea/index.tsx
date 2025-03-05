'use client';

import clsx from 'clsx';
import { Description, Field, Label, Textarea as TA } from '@headlessui/react';

export default function Textarea({
  title,
  desc,
  placeholder = '',
  onChange = () => {},
}: {
  title?: string;
  desc?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Field>
      {title && (
        <Label className="text-sm/6 font-medium dark:text-white">{title}</Label>
      )}
      {desc && (
        <Description className="text-sm/6 dark:text-white/50">
          {desc}
        </Description>
      )}
      <TA
        className={clsx(
          'mt-3 block w-full resize-none rounded-lg border-none bg-neutral-800/5 px-3 py-1.5 text-sm/6',
          'dark:bg-white/5 dark:text-white',
          'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
        )}
        rows={3}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
