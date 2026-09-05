'use client';

import type { SwitchLabelProps, SwitchProps } from './types';

import { useId } from 'react';

import { cn } from '@/utils/cn';

import { switchSizeStyles } from './switch.variants';
import {
  DEFAULT_SWITCH_SIZE,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_HIGHLIGHT_ICON_ON_CHECKED,
} from './constants';

export function Switch({
  checked,
  onChange,
  label,
  icon,
  iconClassName = '',
  highlightIconOnChecked = DEFAULT_HIGHLIGHT_ICON_ON_CHECKED,
  size = DEFAULT_SWITCH_SIZE,
  labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
  disabled = false,
  className = '',
  labelClassName = '',
  id,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id || generatedId;

  const currentSize = switchSizeStyles[size] || switchSizeStyles.sm;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex cursor-pointer select-none items-center transition-colors',
        currentSize.gap,
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {labelPosition === 'left' && (
        <SwitchLabel
          label={label}
          icon={icon}
          iconClassName={iconClassName}
          highlightIconOnChecked={highlightIconOnChecked}
          textSize={currentSize.textSize}
          iconSize={currentSize.iconSize}
          checked={checked}
          disabled={disabled}
          className={labelClassName}
        />
      )}
      <div className="relative shrink-0">
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="peer sr-only"
        />
        {/* Track */}
        <div
          className={cn(
            'rounded-full transition-colors duration-200 ease-in-out',
            currentSize.track,
            'bg-neutral-200 dark:bg-neutral-700',
            'peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600'
          )}
        />
        {/* Knob */}
        <div
          className={cn(
            'absolute rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
            currentSize.knob,
            'dark:bg-neutral-100'
          )}
        />
      </div>
      {labelPosition === 'right' && (
        <SwitchLabel
          label={label}
          icon={icon}
          iconClassName={iconClassName}
          highlightIconOnChecked={highlightIconOnChecked}
          textSize={currentSize.textSize}
          iconSize={currentSize.iconSize}
          checked={checked}
          disabled={disabled}
          className={labelClassName}
        />
      )}
    </label>
  );
}

function SwitchLabel({
  label,
  icon: Icon,
  iconClassName,
  highlightIconOnChecked = DEFAULT_HIGHLIGHT_ICON_ON_CHECKED,
  textSize,
  iconSize,
  checked,
  disabled,
  className,
}: SwitchLabelProps) {
  if (!label && !Icon) return null;

  const iconColorClass = highlightIconOnChecked
    ? checked
      ? 'text-sky-600 dark:text-sky-400'
      : 'text-slate-400 dark:text-slate-500'
    : 'text-slate-400 dark:text-slate-500';

  return (
    <span
      className={cn(
        'inline-flex select-none items-center gap-1.5 font-medium transition-colors',
        textSize,
        checked
          ? 'font-semibold text-slate-900 dark:text-slate-100'
          : 'text-slate-600 dark:text-slate-400',
        disabled && 'opacity-50',
        className
      )}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={cn(
            'shrink-0 transition-colors',
            iconColorClass,
            iconClassName
          )}
        />
      )}
      {label && <span>{label}</span>}
    </span>
  );
}
