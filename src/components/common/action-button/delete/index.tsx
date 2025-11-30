'use client';

import { ActionButtonProps } from '@/types/common/action-button';
import { MouseEventHandler } from 'react';
import { Trash2 } from 'lucide-react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface Props extends ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function DeleteAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
}: Props) {
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
