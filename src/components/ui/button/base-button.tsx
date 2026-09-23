'use client';

import type { MouseEventHandler } from 'react';
import type { BaseButtonProps } from './types';

import { isFunction } from 'lodash';

import { cn } from '@/utils/cn';

import {
  buttonBaseStyles,
  buttonGaps,
  buttonIconSizes,
  buttonRoundedMap,
  buttonSizes,
  getButtonVariants,
  iconBaseStyles,
} from './button.variants';
import {
  DEFAULT_BUTTON_BORDERED,
  DEFAULT_BUTTON_DISABLED,
  DEFAULT_BUTTON_HOVER_EFFECT,
  DEFAULT_BUTTON_ICON_STROKE_WIDTH,
  DEFAULT_BUTTON_ROUNDED,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
} from './constants';

export function BaseButton({
  ref,
  children,
  onClick,
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
  rounded = DEFAULT_BUTTON_ROUNDED,
  bordered = DEFAULT_BUTTON_BORDERED,
  className = '',
  icon: Icon,
  iconStrokeWidth = DEFAULT_BUTTON_ICON_STROKE_WIDTH,
  iconClassName = '',
  disabled = DEFAULT_BUTTON_DISABLED,
  hoverEffect = DEFAULT_BUTTON_HOVER_EFFECT,
  ariaLabel,
  title,
  ...restProps
}: BaseButtonProps) {
  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled || !isFunction(onClick)) return;
    onClick(e);
  };

  const hasChildren = Boolean(children);
  const sizeConfig = buttonSizes[size] || buttonSizes.base;
  const iconSize = buttonIconSizes[size] || 18;
  const variants = getButtonVariants(disabled, hoverEffect);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onButtonClick}
      disabled={disabled}
      className={cn(
        buttonBaseStyles,
        variants[variant] || variants.primary,
        sizeConfig.text,
        sizeConfig.padding(hasChildren),
        buttonGaps[size] || 'gap-2',
        buttonRoundedMap[rounded] || buttonRoundedMap.lg,
        bordered ? 'border' : '',
        className
      )}
      aria-label={ariaLabel || title}
      {...restProps}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className={cn(iconBaseStyles, iconClassName)}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {children}
    </button>
  );
}
