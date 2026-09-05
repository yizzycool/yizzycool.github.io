'use client';

import type { ReactNode } from 'react';
import type { ColorPickerProps } from './types';

import { cn } from '@/utils/cn';
import {
  colorPickerInputBaseStyles,
  colorPickerWrapperBaseStyles,
} from './color-picker.variants';

export function ColorPicker({
  value,
  onChange,
  variant = 'input',
  label,
  showHex = true,
  id,
  className,
  inputClassName,
  ariaLabel,
  disabled = false,
}: ColorPickerProps) {
  const isCard = variant === 'card';

  return (
    <ColorPickerWrapper
      isCard={isCard}
      label={label}
      showHex={showHex}
      value={value}
      className={className}
    >
      <input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          colorPickerInputBaseStyles,
          disabled && 'cursor-not-allowed opacity-50',
          !isCard && className,
          inputClassName
        )}
        aria-label={ariaLabel ?? label ?? 'Color picker'}
      />
    </ColorPickerWrapper>
  );
}

type ColorPickerWrapperProps = {
  isCard: boolean;
  label?: string;
  showHex?: boolean;
  value: string;
  className?: string;
  children: ReactNode;
};

function ColorPickerWrapper({
  isCard,
  label,
  showHex = true,
  value,
  className,
  children,
}: ColorPickerWrapperProps) {
  if (!isCard) {
    return <>{children}</>;
  }

  return (
    <div className={cn(colorPickerWrapperBaseStyles, className)}>
      <div>
        {label && (
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </span>
        )}
        {showHex && (
          <span className="font-mono text-sm font-medium uppercase text-slate-700 dark:text-slate-200">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
