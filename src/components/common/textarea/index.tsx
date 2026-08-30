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
          'block w-full rounded-xl border px-4 py-3.5',
          'resize-none text-sm leading-relaxed outline-none transition-all duration-200',
          'shadow-2xs border-neutral-200/90 bg-white/80 text-slate-800 placeholder-neutral-400/80 backdrop-blur-md',
          'dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100 dark:placeholder-neutral-500',
          'focus:shadow-xs focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20',
          'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40',
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
