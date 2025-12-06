'use client';

import { MouseEventHandler } from 'react';
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { CircleAlert } from 'lucide-react';

type Props = {
  errorString?: string;
  open: boolean;
  onClose: () => void;
};

export default function ErrorDialog({
  errorString = 'Something went wrong! Please try again later.',
  open,
  onClose = () => {},
}: Props) {
  const onDialogClose = (_: boolean): void => onClose();
  const onClick: MouseEventHandler<HTMLButtonElement> = () => onClose();

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onDialogClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-md rounded-xl bg-red-900/30 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="flex items-center text-lg font-bold text-white"
            >
              <CircleAlert className="mr-2 h-6 w-6 text-red-500" />
              Error
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-neutral-400">{errorString}</p>
            <div className="mt-4 flex justify-end">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-rose-600 data-[open]:bg-rose-700 data-[focus]:outline-1 data-[focus]:outline-white"
                onClick={onClick}
              >
                OK
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
