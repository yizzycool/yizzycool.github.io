'use client';

import type { MouseEventHandler } from 'react';
import type { DeleteActionProps } from './types';

import { Trash2 } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function DeleteAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  label = 'Clear',
  ariaLabel,
  title,
  onClick = () => {},
}: DeleteActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    onClick(e);
  };

  return (
    <Button
      variant={variant}
      onClick={onButtonClick}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={cn(
        !disabled && [
          'hover:border-rose-300 dark:hover:border-rose-900/60',
          'hover:bg-rose-50 dark:hover:bg-rose-950/40',
          'hover:text-rose-600 dark:hover:text-rose-400',
        ],
        className
      )}
      icon={showIcon ? Trash2 : undefined}
      disabled={disabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {showLabel ? label : null}
    </Button>
  );
}
