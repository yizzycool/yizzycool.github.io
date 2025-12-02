'use client';

import { ActionButtonProps } from '@/types/common/action-button';
import { MouseEventHandler, useState } from 'react';
import { LucideIcon, SlidersVertical } from 'lucide-react';
import useDisplay from '../action-button/hooks/use-display';
import Button from '../button';
import GeneralDialog from '../dialog/general';

interface Props extends ActionButtonProps {
  title?: string;
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

export default function ConfigDialog({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  title,
  icon,
  onClick = () => {},
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { showIcon, showLabel } = useDisplay({ display });

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;

    setIsOpen(true);
    onClick(e);
  };

  return (
    <>
      <Button
        onClick={onButtonClick}
        variant="outline"
        size={size}
        rounded="full"
        className=""
        icon={showIcon ? SlidersVertical : undefined}
        disabled={disabled}
      >
        {showLabel ? 'Configure Parameters' : null}
      </Button>
      {!!children && (
        <GeneralDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={title}
          icon={icon}
        >
          {children}
        </GeneralDialog>
      )}
    </>
  );
}
