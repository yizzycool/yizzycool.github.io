'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { ChevronDownIcon, PhotoIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function Navigation() {
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBody(window.document.body);
  }, []);

  if (!body) return;

  return (
    <>
      {/* Tools */}
      <Popover className="group relative">
        <PopoverButton
          className={clsx(
            'flex items-center gap-2',
            'focus:outline-none',
            'data-[active]:text-neutral-500 dark:data-[active]:text-white',
            'data-[hover]:text-neutral-500 dark:data-[hover]:text-white'
          )}
        >
          Tools
          <ChevronDownIcon className="size-5 transition-transform duration-200 group-data-[open]:rotate-180" />
        </PopoverButton>
        <PopoverPanel
          transition
          anchor="bottom end"
          className={clsx(
            'z-10 mt-6 origin-top-right rounded-md px-4 py-2 text-sm/6 font-semibold',
            'border border-neutral-800/20 dark:border-white/20',
            'bg-white/95 backdrop-blur-lg dark:bg-neutral-800',
            'focus:outline-none',
            'transition duration-100 ease-out',
            'data-[closed]:scale-95 data-[closed]:opacity-0'
          )}
        >
          <div
            className={clsx(
              'group flex rounded-lg px-4 py-4',
              'hover:bg-gray-100 dark:hover:bg-neutral-700'
            )}
          >
            <div
              className={clsx(
                'h-12 w-12 rounded-md p-2',
                'bg-none dark:bg-neutral-700'
              )}
            >
              <PhotoIcon className="w-full group-hover:text-sky-500" />
            </div>
            <div className="ml-4">
              <div className="font-bold text-gray-900 dark:text-gray-400">
                Image Tools
              </div>
              <Link
                className="text-gray-600 hover:underline dark:text-gray-300"
                href="/tools/image-tool/base64-to-image"
              >
                Base64 to Image
              </Link>
            </div>
          </div>
        </PopoverPanel>
        {createPortal(
          <PopoverBackdrop className="fixed inset-0 z-10 bg-transparent" />,
          body
        )}
      </Popover>
    </>
  );
}
