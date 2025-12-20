'use client';

import clsx from 'clsx';
import { Description, Field, Label, Textarea as TA } from '@headlessui/react';
import { ChangeEvent } from 'react';

type Props = {
  title?: string;
  desc?: string;
  id?: string;
  value?: string;
  readOnly?: boolean;
  rows?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function Textarea({
  title,
  desc,
  id,
  value,
  readOnly,
  rows = 3,
  placeholder = '',
  autoFocus = false,
  className = '',
  onChange = () => {},
}: Props) {
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
          'w-full rounded-lg border px-4 py-3',
          'resize-none font-mono text-sm leading-relaxed outline-none',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur',
          'text-neutral-700 dark:text-neutral-200',
          'placeholder-neutral-400 dark:placeholder-neutral-500',
          'focus:border-transparent focus:ring-2 focus:ring-blue-500',
          className
        )}
        rows={rows}
        id={id}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e)}
      />
    </Field>
  );
}
