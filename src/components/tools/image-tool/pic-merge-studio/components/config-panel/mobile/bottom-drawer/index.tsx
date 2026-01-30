'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import { Transition, TransitionChild } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Button from '@/components/common/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function BottomDrawer({ isOpen, onClose, children }: Props) {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const node = document.getElementById(
      'pic-merge-studio-mobile-config-drawer'
    );
    setNode(node);

    // Add custom event listener
    const onSwitchTab = (e: CustomEvent) => {
      if (e.detail.tab !== 'Image') return;
      onClose();
    };

    const unsubscriber = customEventUtils.on(
      CustomEvents.common.switchTab,
      onSwitchTab
    );

    return () => {
      unsubscriber();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!node) return;

  return createPortal(
    <Transition show={isOpen}>
      <TransitionChild
        enter="ease-out duration-300"
        enterFrom="translate-y-full"
        enterTo="translate-y-0"
        leave="ease-in duration-300"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-full"
      >
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 min-h-[200px] overflow-hidden',
            'rounded-t-3xl',
            'bg-white/80 backdrop-blur dark:bg-neutral-900/80'
          )}
        >
          <div className="py-3">
            <div className="mx-auto h-1 w-8 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          </div>

          {children}

          <Button
            variant="ghost"
            onClick={onClose}
            icon={X}
            rounded="full"
            className="absolute right-1 top-1"
          >
            {/* <X size={20} /> */}
          </Button>
        </div>
      </TransitionChild>
    </Transition>,
    node
  );
}
