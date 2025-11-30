'use client';

import { ActionButtonProps } from '@/types/common/action-button';
import { ArrowDownUp } from 'lucide-react';
import { MouseEventHandler } from 'react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface Props extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function SwapAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
}: Props) {
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
