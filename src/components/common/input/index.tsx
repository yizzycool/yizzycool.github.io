'use client';

import { cn } from '@/utils/cn';
import {
  Description,
  Field,
  Input as HeadlessInput,
  Label,
} from '@headlessui/react';
import { ChangeEvent, HTMLInputTypeAttribute, KeyboardEvent } from 'react';

type Props = {
  title?: string;
  desc?: string;
  id?: string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export default function Input({
  title,
  desc,
  id,
  type = 'text',
  value,
  readOnly,
  disabled,
  placeholder = '',
  autoFocus = false,
  className = '',
  onChange = () => {},
  onKeyDown,
}: Props) {
  return (
    <Field className="w-full">
      {title && <Label className="text-sm/6 font-bold">{title}</Label>}
      {desc && (
        <Description className="mb-3 text-sm/6 text-slate-500 dark:text-slate-400">
          {desc}
        </Description>
      )}
      <HeadlessInput
        type={type}
        className={cn(
          'block w-full rounded-lg border px-4 py-3',
          'text-sm leading-relaxed outline-none',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/40 dark:bg-neutral-900/40',
          'text-slate-700 dark:text-slate-200',
          'placeholder-neutral-400 dark:placeholder-neutral-500',
          'focus:border-transparent focus:ring-2 focus:ring-blue-500',
          className
        )}
        id={id}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
        onChange={(e) => onChange(e)}
        onKeyDown={onKeyDown}
      />
    </Field>
  );
}
