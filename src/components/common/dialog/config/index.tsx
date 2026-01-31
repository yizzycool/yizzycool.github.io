'use client';

import type { ActionButtonProps } from '@/types/common/action-button';

import { LucideIcon, Settings2, SlidersVertical, X } from 'lucide-react';
import { MouseEventHandler, useEffect, useState } from 'react';

import useDisplay from '../../action-button/hooks/use-display';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '../../button';
import BaseDialog from '../base';

interface Props extends ActionButtonProps {
  title?: string;
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

export default function ConfigDialog({
  display = 'icon-label',
  size = 'sm',
  disabled = false,
  title = 'Configuration',
  icon: Icon = Settings2,
  onClick = () => {},
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { showIcon, showLabel } = useDisplay({ display });

  // Create customEvent listener to toggle dialog
  useEffect(() => {
    const toggleConfigDialog = (e: CustomEvent) => {
      if (e.detail?.isOpen === undefined) {
        setIsOpen((prev) => !prev);
      } else {
        setIsOpen(e.detail.isOpen);
      }
    };

    const unsubscriber = customEventUtils.on(
      CustomEvents.common.toggleConfigDialog,
      toggleConfigDialog
    );

    return () => {
      unsubscriber();
    };
  }, []);

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
        iconClassName="group-hover:rotate-90 transition-all duration-500"
        disabled={disabled}
      >
        {showLabel ? 'Configure Parameters' : null}
      </Button>
      {!!children && (
        <BaseDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="flex items-center justify-end px-8 pb-4 pt-6">
            <Icon size={20} className="mr-2" />
            <h2 className="mr-4 flex-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="-mr-2 rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </BaseDialog>
      )}
    </>
  );
}
