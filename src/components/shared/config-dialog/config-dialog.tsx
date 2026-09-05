'use client';

import type { MouseEventHandler } from 'react';
import type { ConfigDialogProps } from './types';

import { Settings2, SlidersVertical, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/dialog';
import { useDisplay } from '@/components/shared/action-button';
import {
  configDialogCloseButtonStyles,
  configDialogHeaderStyles,
  configDialogTitleStyles,
} from './config-dialog.variants';

export function ConfigDialog({
  display = 'icon-label',
  size = 'sm',
  disabled = false,
  title = 'Configuration',
  icon: Icon = Settings2,
  onClick = () => {},
  children,
}: ConfigDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { showIcon, showLabel } = useDisplay({ display });

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
          <div className={configDialogHeaderStyles}>
            <Icon size={20} className="mr-2" />
            <h2 className={configDialogTitleStyles}>{title}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className={configDialogCloseButtonStyles}
              aria-label="Close configuration dialog"
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
