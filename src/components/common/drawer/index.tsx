'use client';

import type { Rounded } from '@/types/common';

import clsx from 'clsx';
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react';

type Side = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  side?: Side;
  rounded?: Rounded;
  wrapperClassName?: string;
  backdrop?: boolean;
  className?: string;
  usePortal?: boolean;
  children?: React.ReactNode;
};

const RoundedMap: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const RoundedSideMap: Record<Side, (r: string) => string> = {
  top: (r) => r.replace('rounded', 'rounded-b'),
  bottom: (r) => r.replace('rounded', 'rounded-t'),
  left: (r) => r.replace('rounded', 'rounded-r'),
  right: (r) => r.replace('rounded', 'rounded-l'),
};

export default function Drawer({
  isOpen,
  onClose,
  side = 'right',
  rounded = 'none',
  wrapperClassName = '',
  backdrop = true,
  className = '',
  usePortal = true,
  children,
}: Props) {
  const enterFrom = {
    top: '-translate-y-full',
    bottom: 'translate-y-full',
    left: '-translate-x-full',
    right: 'translate-x-full',
  };

  const enterTo = {
    top: 'translate-y-0',
    bottom: 'translate-y-0',
    left: 'translate-x-0',
    right: 'translate-x-0',
  };

  const positions = {
    top: 'top-0 left-0 w-full max-h-[90%]',
    bottom: 'bottom-0 left-0 w-full max-h-[90%]',
    left: 'top-0 left-0 h-full max-w-[90%]',
    right: 'top-0 right-0 h-full max-w-[90%]',
  };

  return (
    <Transition show={isOpen}>
      <Wrapper
        usePortal={usePortal}
        as="div"
        className={clsx(
          usePortal ? 'fixed z-50' : 'absolute z-10',
          'inset-0 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12',
          wrapperClassName
        )}
        onClose={onClose}
      >
        {backdrop && (
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-md dark:bg-black/40"
              onClick={onClose}
            />
          </TransitionChild>
        )}
        {/* Rounded Border */}
        <TransitionChild
          enter="ease-out duration-500"
          enterFrom={enterFrom[side]}
          enterTo={enterTo[side]}
          leave="ease-in duration-500"
          leaveFrom={enterTo[side]}
          leaveTo={enterFrom[side]}
        >
          <div
            className={clsx(
              'absolute flex flex-col overflow-hidden shadow-2xl',
              'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95',
              positions[side],
              RoundedSideMap[side](RoundedMap[rounded]),
              className
            )}
          >
            {children}
          </div>
        </TransitionChild>
      </Wrapper>
    </Transition>
  );
}

function Wrapper({
  usePortal,
  children,
  ...rests
}: {
  usePortal: boolean;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  onClose: (value: boolean) => void;
}) {
  if (usePortal) {
    return <Dialog {...rests}>{children}</Dialog>;
  }
  return <div {...rests}>{children}</div>;
}
