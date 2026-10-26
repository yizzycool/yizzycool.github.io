'use client';

import type { MouseEventHandler } from 'react';
import type { SwapActionProps } from './types';

import { ArrowDownUp } from 'lucide-react';

import toast from '@/utils/toast';

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
  successToast = true,
}: SwapActionProps) {
  const { showIcon, showLabel } = useDisplay({ display });

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    onClick(e);

    if (successToast) {
      const msg = typeof successToast === 'string' ? successToast : 'Swapped';
      toast.success(msg);
    }
  };

  return (
    <Button
      onClick={onButtonClick}
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
