'use client';

import { Description, Field, Label, Textarea as TA } from '@headlessui/react';
import React, { ChangeEvent } from 'react';

import { cn } from '@/utils/cn';

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
  ref?: React.Ref<HTMLElement>;
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
  ref,
}: Props) {
  return (
    <Field className="w-full">
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
      <TA
        ref={ref}
        className={cn(
          'block w-full rounded-lg border px-4 py-3',
          'resize-none text-sm leading-relaxed outline-none',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/40 dark:bg-neutral-900/40',
          'text-slate-700 dark:text-slate-200',
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
        spellCheck={false}
        onChange={(e) => onChange(e)}
      />
    </Field>
  );
}
