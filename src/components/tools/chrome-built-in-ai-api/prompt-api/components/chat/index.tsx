'use client';

import { Dialog, DialogPanel } from '@headlessui/react';
import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  return (
    <>
      <button
        className={clsx(
          'bg-gradient-to-r from-indigo-500/80 from-10% via-sky-500/80 via-30% to-emerald-500/80 to-90%',
          'w-full rounded-lg p-4 text-lg font-bold transition-opacity duration-200 hover:opacity-90'
        )}
        onClick={() => setIsOpen(true)}
      >
        Start New Chat
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className={clsx(
          'fixed inset-0 mt-[68px] flex w-screen items-center justify-center bg-black/30',
          'data-[closed]:opacity-0'
        )}
      >
        <DialogPanel className="flex h-full w-full flex-col items-center space-y-4 p-12 backdrop-blur-lg">
          <button
            className="absolute right-0 top-0 p-4"
            onClick={() => setIsOpen(false)}
          >
            <XIcon />
          </button>
          Under Development...
          <div className="absolute bottom-4 left-1/2 w-[90%] max-w-[600px] -translate-x-1/2">
            <textarea
              autoFocus
              placeholder="You can ask me anything!"
              className={clsx(
                'min-h-30 block w-full flex-1 resize-none rounded-xl border-none bg-neutral-800 px-6 py-4',
                'outline-none focus:outline-none'
              )}
              onChange={onChange}
              value={text}
            />
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
