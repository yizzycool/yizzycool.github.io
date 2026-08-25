'use client';

import { LucideIcon, X } from 'lucide-react';
import Button from '@/components/common/button';
import { cn } from '@/utils/cn';
import {
  Description,
  Field,
  Input as HeadlessInput,
  Label,
} from '@headlessui/react';
import {
  ChangeEvent,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  useRef,
} from 'react';

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
  icon?: LucideIcon;
  iconClassName?: string;
  onClear?: () => void;
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
  icon: Icon,
  iconClassName = '',
  onClear,
  onChange = () => {},
  onKeyDown,
}: Props) {
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
          type={type}
          className={cn(
            'block w-full rounded-lg border px-4 py-3',
            'text-sm leading-relaxed outline-none',
            'border-neutral-200 dark:border-neutral-700',
            'bg-white/40 dark:bg-neutral-900/40',
            'text-slate-700 dark:text-slate-200',
            'placeholder-neutral-400 dark:placeholder-neutral-500',
            'focus:border-transparent focus:ring-2 focus:ring-blue-500',
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
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          />
        )}
      </div>
    </Field>
  );
}
