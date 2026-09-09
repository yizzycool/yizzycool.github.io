'use client';

import type { SwapActionProps } from './types';

import { ArrowDownUp } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function SwapAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  label = 'Swap',
  ariaLabel,
  title,
  onClick = () => {},
}: SwapActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={showIcon ? ArrowDownUp : undefined}
      disabled={disabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {showLabel ? label : null}
    </Button>
  );
}
