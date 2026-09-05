'use client';

import type { MouseEventHandler } from 'react';
import type { DeleteActionProps } from './types';

import { Trash2 } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function DeleteAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
}: DeleteActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    onClick(e);
  };

  return (
    <Button
      variant="error"
      onClick={onButtonClick}
      size={size}
      icon={showIcon ? Trash2 : undefined}
      disabled={disabled}
    >
      {showLabel ? 'Clear' : null}
    </Button>
  );
}
