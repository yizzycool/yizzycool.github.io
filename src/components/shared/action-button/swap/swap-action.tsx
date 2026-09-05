'use client';

import type { SwapActionProps } from './types';

import { ArrowDownUp } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function SwapAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
}: SwapActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size={size}
      rounded="full"
      className="rounded-lg sm:rounded-full"
      icon={showIcon ? ArrowDownUp : undefined}
      disabled={disabled}
    >
      {showLabel ? 'Swap' : null}
    </Button>
  );
}
