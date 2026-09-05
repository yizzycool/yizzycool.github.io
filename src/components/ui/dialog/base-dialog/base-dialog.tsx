'use client';

import type { BaseDialogProps, PortalConfig } from './types';

import { Transition, TransitionChild } from '@headlessui/react';
import { useEffect } from 'react';

import useIsClient from '@/hooks/lifecycle/use-is-client';
import { cn } from '@/utils/cn';
import { ClientPortal } from '@/components/ui/client-portal';
import {
  baseDialogBackdropStyles,
  baseDialogPanelStyles,
  baseDialogWrapperStyles,
} from './base-dialog.variants';

const defaultPortalConfig: PortalConfig = {
  portalKey: 'base-dialog',
};

export function BaseDialog({
  isOpen,
  onClose = () => {},
  hasBackdrop = true,
  className = '',
  dialogClassName = '',
  backdropClassName = '',
  children,
  portalConfig = {},
}: BaseDialogProps) {
  const isClient = useIsClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!isClient) return null;

  return (
    <ClientPortal
      selectorOrElement={
        portalConfig.selectorOrElement || defaultPortalConfig.selectorOrElement
      }
      portalKey={portalConfig.portalKey || defaultPortalConfig.portalKey}
    >
      <Transition show={isOpen} unmount={true} appear={true}>
        <div
          role="dialog"
          className={cn(
            baseDialogWrapperStyles,
            !hasBackdrop && 'pointer-events-none',
            dialogClassName
          )}
        >
          {/* Backdrop */}
          {hasBackdrop && (
            <TransitionChild
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              unmount={false}
            >
              <div
                className={cn(baseDialogBackdropStyles, backdropClassName)}
                onClick={onClose}
              />
            </TransitionChild>
          )}
          {/* Rounded Border */}
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            unmount={false}
          >
            <div
              className={cn(
                baseDialogPanelStyles,
                !hasBackdrop && 'pointer-events-auto',
                className
              )}
            >
              {children}
            </div>
          </TransitionChild>
        </div>
      </Transition>
    </ClientPortal>
  );
}
