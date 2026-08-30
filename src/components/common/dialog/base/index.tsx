'use client';

import { Transition, TransitionChild } from '@headlessui/react';
import { useEffect } from 'react';

import { cn } from '@/utils/cn';
import useIsClient from '@/hooks/lifecycle/use-is-client';

import ClientPortal from '../../client-portal';

type PortalConfig = {
  selectorOrElement?: string | HTMLElement;
  portalKey?: string;
};

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  hasBackdrop?: boolean;
  className?: string;
  dialogClassName?: string;
  backdropClassName?: string;
  children?: React.ReactNode;
  portalConfig?: PortalConfig;
};

const defaultProtalConfig: PortalConfig = {
  portalKey: 'base-dialog',
};

export default function BaseDialog({
  isOpen,
  onClose = () => {},
  hasBackdrop = true,
  className = '',
  dialogClassName = '',
  backdropClassName = '',
  children,
  portalConfig = {},
}: Props) {
  const isClient = useIsClient();

  useEffect(() => {
    // Handle Esc keyboard shortcut
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
        portalConfig.selectorOrElement || defaultProtalConfig.selectorOrElement
      }
      portalKey={portalConfig.portalKey || defaultProtalConfig.portalKey}
    >
      <Transition show={isOpen} unmount={true} appear={true}>
        <div
          role="dialog"
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12',
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
                className={cn(
                  'absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40',
                  backdropClassName
                )}
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
                'relative flex max-h-full w-fit max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl',
                'bg-white dark:bg-[#111]',
                'border border-neutral-200 dark:border-neutral-600',
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
