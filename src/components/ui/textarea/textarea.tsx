'use client';

import type { TextareaProps } from './types';

import { Description, Field, Label, Textarea as TA } from '@headlessui/react';

import { cn } from '@/utils/cn';
import { ErrorMessage } from '@/components/ui/error-message';
import { textareaBaseStyles, textareaErrorStyles } from './textarea.variants';

export function Textarea({
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
  onClick,
  errorMessage,
  ref,
}: TextareaProps) {
  const hasError = Boolean(errorMessage);

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
          textareaBaseStyles,
          hasError && textareaErrorStyles,
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
        onClick={onClick}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
      />
      <ErrorMessage
        id={id ? `${id}-error` : undefined}
        message={errorMessage}
      />
    </Field>
  );
}
