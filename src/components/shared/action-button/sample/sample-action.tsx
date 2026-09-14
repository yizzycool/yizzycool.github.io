'use client';

import type { MouseEventHandler } from 'react';
import type { SampleActionProps } from './types';

import { Sparkles } from 'lucide-react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function SampleAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  label = 'Sample',
  icon: Icon = Sparkles,
  ariaLabel,
  title,
  onClick = () => {},
}: SampleActionProps) {
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
      className={className}
      icon={showIcon ? Icon : undefined}
      disabled={disabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {showLabel ? label : null}
    </Button>
  );
}
