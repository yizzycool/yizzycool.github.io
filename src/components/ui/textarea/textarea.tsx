'use client';

import type { TextareaProps } from './types';

import { Description, Field, Label, Textarea as TA } from '@headlessui/react';

import { cn } from '@/utils/cn';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  textareaBaseStyles,
  textareaDescStyles,
  textareaErrorStyles,
  textareaHeaderStyles,
  textareaLabelStyles,
} from './textarea.variants';

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
      {(title || desc) && (
        <div className={textareaHeaderStyles}>
          {title && <Label className={textareaLabelStyles}>{title}</Label>}
          {desc && (
            <Description className={textareaDescStyles}>{desc}</Description>
          )}
        </div>
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
