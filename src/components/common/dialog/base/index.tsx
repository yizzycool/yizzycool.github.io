'use client';

import clsx from 'clsx';
import { Transition, TransitionChild } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
};

export default function BaseDialog({
  isOpen,
  onClose,
  className = '',
  children,
}: Props) {
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBody(document.body);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!body) return null;

  return createPortal(
    <Transition show={isOpen} unmount={false} appear={true}>
      <div
        role="dialog"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12"
      >
        {/* Backrop */}
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
            className="absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40"
            onClick={onClose}
          />
        </TransitionChild>
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
            className={clsx(
              'relative flex max-h-full w-fit max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl',
              'bg-white dark:bg-[#111]',
              'border border-neutral-200 dark:border-neutral-700',
              className
            )}
          >
            {children}
          </div>
        </TransitionChild>
      </div>
    </Transition>,
    body,
    'base-dialog'
  );
}
