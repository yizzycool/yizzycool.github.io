'use client';

import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { LucideIcon, X } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
};

export default function GeneralDialog({
  isOpen,
  onClose,
  title = '',
  showCloseButton = true,
  icon: Icon,
  className = '',
  children,
}: Props) {
  return (
    <Transition show={isOpen}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12"
        onClose={onClose}
      >
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop
            className="absolute inset-0 bg-slate-200/80 backdrop-blur-md dark:bg-black/80"
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
        >
          <div
            className={clsx(
              'relative flex max-h-full w-fit max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl',
              'bg-white dark:bg-[#111]',
              'border border-slate-900/5 dark:border-white/10',
              className
            )}
          >
            {(!!Icon || !!title || showCloseButton) && (
              <div className="flex items-center justify-end px-8 pb-4 pt-6">
                {!!Icon && <Icon size={20} className="mr-2" />}
                {!!title && (
                  <h2 className="mr-4 flex-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="-mr-2 rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            {children}
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
