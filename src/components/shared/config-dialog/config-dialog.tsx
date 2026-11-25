'use client';

import type { MouseEventHandler } from 'react';
import type { ConfigDialogProps } from './types';

import { Settings, Settings2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BaseDialog } from '@/components/ui/dialog';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import {
  configDialogCloseButtonStyles,
  configDialogHeaderStyles,
  configDialogTitleStyles,
} from './config-dialog.variants';

export function ConfigDialog({
  disabled = false,
  title = 'Configuration',
  icon: Icon = Settings2,
  onClick = () => {},
  children,
}: ConfigDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <TooltipRoot delay={{ open: 200, close: 100 }}>
        <TooltipTrigger>
          <button
            type="button"
            disabled={disabled}
            onClick={onButtonClick}
            aria-label="Configure Parameters"
            className={cn(
              'group relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
              'border-slate-200/90 bg-white/85 text-slate-600 shadow-sm shadow-slate-900/5 backdrop-blur-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
              'dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-300 dark:shadow-black/30',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-white'
            )}
          >
            <Settings
              size={18}
              strokeWidth={1.85}
              className={cn(
                !disabled &&
                  'transition-transform duration-300 group-hover:rotate-45'
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipPopup
          placement="bottom-end"
          className="whitespace-nowrap px-2.5 py-1.5"
        >
          <span>Configure Parameters</span>
        </TooltipPopup>
      </TooltipRoot>

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
