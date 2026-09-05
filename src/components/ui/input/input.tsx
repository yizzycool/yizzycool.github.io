'use client';

import type { KeyboardEvent } from 'react';
import type { InputProps } from './types';

import {
  Description,
  Field,
  Input as HeadlessInput,
  Label,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { useRef } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { inputBaseStyles, inputClearButtonStyles } from './input.variants';

export function Input({
  ref,
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
  icon: Icon,
  iconClassName = '',
  onClear,
  onChange = () => {},
  onKeyDown,
}: InputProps) {
  const isComposingRef = useRef(false);

  const hasValue = Boolean(
    value !== undefined && value !== null && String(value).length > 0
  );
  const showClear = Boolean(onClear && hasValue && !readOnly && !disabled);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isComposingRef.current || e.nativeEvent.isComposing) {
      return;
    }
    onKeyDown?.(e);
  };

  return (
    <Field className="w-full">
      {title && <Label className="text-sm/6 font-bold">{title}</Label>}
      {desc && (
        <Description className="mb-3 text-sm/6 text-slate-500 dark:text-slate-400">
          {desc}
        </Description>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5">
            <Icon
              className={cn(
                'h-4 w-4 text-slate-400 dark:text-slate-500',
                iconClassName
              )}
            />
          </div>
        )}
        <HeadlessInput
          ref={ref}
          type={type}
          className={cn(
            inputBaseStyles,
            Icon && 'pl-10',
            showClear && 'pr-10',
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
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
        />
        {showClear && (
          <Button
            onClick={() => onClear?.()}
            variant="ghost"
            size="xs"
            rounded="full"
            icon={X}
            ariaLabel="Clear input"
            className={inputClearButtonStyles}
          />
        )}
      </div>
    </Field>
  );
}
