'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CloseButton,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Tools } from '../..';

export default function ToolsSelectorDesktop() {
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBody(window.document.body);
  }, []);

  return (
    <>
      {/* Tools */}
      <Popover className="group relative">
        <PopoverButton
          className={clsx(
            'flex items-center gap-2 transition-opacity',
            'focus:outline-none',
            'data-[active]:opacity-80 data-[hover]:opacity-80'
          )}
        >
          Tools
          <ChevronDown className="size-5 transition-transform duration-200 group-data-[open]:rotate-180" />
        </PopoverButton>
        <PopoverPanel
          transition
          anchor="bottom end"
          className={clsx(
            'z-10 mt-[1.6rem] origin-top-right rounded-md py-2 text-sm/6 font-semibold',
            'border border-neutral-800/20 dark:border-white/20',
            'bg-white/95 backdrop-blur-lg dark:bg-neutral-800',
            'focus:outline-none',
            'transition duration-100 ease-out',
            'data-[closed]:scale-95 data-[closed]:opacity-0'
          )}
        >
          {Tools.map((tool) => (
            <div
              key={tool.name}
              className="flex p-4 pr-16 hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <div className="w-full">
                <div className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-200">
                  {tool.name}
                </div>
                {tool.items.map((item) => (
                  <CloseButton
                    as={Link}
                    key={item.name}
                    className="mt-2 flex items-center text-gray-600 hover:text-sky-500 hover:underline dark:text-gray-50 dark:hover:text-sky-500"
                    href={item.href}
                  >
                    <div className="mr-3 h-8 w-8 rounded border border-gray-300 p-1.5 dark:border-gray-500/50">
                      <item.icon.component className="h-full w-full" />
                    </div>
                    {item.name}
                  </CloseButton>
                ))}
              </div>
            </div>
          ))}
        </PopoverPanel>
        {body &&
          createPortal(
            <PopoverBackdrop className="fixed inset-0 z-0 bg-transparent" />,
            body
          )}
      </Popover>
    </>
  );
}
