'use client';

import type { ChangeEvent } from 'react';
import type { ColorPickerProps } from './types';

import { Pipette } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import {
  colorPickerCardBaseStyles,
  colorPickerInputBaseStyles,
  colorPickerSwatchButtonStyles,
  colorPickerSwatchWrapperStyles,
} from './color-picker.variants';
import {
  DEFAULT_COLOR_PICKER_DISABLED,
  DEFAULT_COLOR_PICKER_SHOW_HEX,
  DEFAULT_COLOR_PICKER_SHOW_TITLE,
  DEFAULT_COLOR_PICKER_VALUE,
  DEFAULT_COLOR_PICKER_VARIANT,
} from './constants';

export function ColorPicker({
  value = DEFAULT_COLOR_PICKER_VALUE,
  onChange,
  onColorChange,
  variant = DEFAULT_COLOR_PICKER_VARIANT,
  label,
  showHex = DEFAULT_COLOR_PICKER_SHOW_HEX,
  title = 'Custom Color',
  showTitle = DEFAULT_COLOR_PICKER_SHOW_TITLE,
  id,
  className,
  inputClassName,
  buttonClassName,
  ariaLabel,
  disabled = DEFAULT_COLOR_PICKER_DISABLED,
  icon: Icon = Pipette,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onColorChange?.(e.target.value);
  };

  const handleButtonClick = () => {
    if (disabled || !inputRef.current) return;
    try {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.click();
      }
    } catch {
      inputRef.current.click();
    }
  };

  if (variant === 'swatch' || variant === 'circle') {
    return (
      <div className={cn(colorPickerSwatchWrapperStyles, className)}>
        <Button
          title={showTitle ? title : undefined}
          onClick={handleButtonClick}
          variant="ghost"
          rounded="full"
          bordered={false}
          hoverEffect={false}
          disabled={disabled}
          style={{
            background:
              'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
          }}
          className={cn(
            colorPickerSwatchButtonStyles,
            'p-0.5',
            buttonClassName
          )}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white p-1 dark:bg-neutral-800">
            <Icon className="h-full w-full text-neutral-600 dark:text-neutral-300" />
          </span>
        </Button>
        <input
          ref={inputRef}
          id={id}
          type="color"
          value={value}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-label={ariaLabel ?? title ?? 'Color picker'}
        />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(colorPickerCardBaseStyles, className)}>
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
        <input
          id={id}
          type="color"
          value={value}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            colorPickerInputBaseStyles,
            disabled && 'cursor-not-allowed opacity-50',
            inputClassName
          )}
          aria-label={ariaLabel ?? label ?? 'Color picker'}
        />
      </div>
    );
  }

  return (
    <input
      id={id}
      type="color"
      value={value}
      disabled={disabled}
      onChange={handleChange}
      className={cn(
        colorPickerInputBaseStyles,
        disabled && 'cursor-not-allowed opacity-50',
        className,
        inputClassName
      )}
      aria-label={ariaLabel ?? label ?? 'Color picker'}
    />
  );
}
