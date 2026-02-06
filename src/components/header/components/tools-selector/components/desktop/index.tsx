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

import { Tools } from '@/data/tools';

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
            'ml-4 flex items-center gap-2 transition-opacity',
            'focus:outline-none',
            'data-[active]:text-black data-[hover]:text-black',
            'dark:data-[active]:text-white dark:data-[hover]:text-white'
          )}
        >
          Tools
          <ChevronDown className="size-5 transition-transform duration-200 group-data-[open]:rotate-180" />
        </PopoverButton>
        <PopoverPanel
          static
          unmount={false}
          anchor={{
            to: 'bottom end',
            gap: 24,
            padding: 16,
          }}
          className={clsx(
            'origin-top-right focus:outline-none',
            'rounded-md py-2 text-sm/6 font-semibold',
            'border border-neutral-800/20 dark:border-white/20',
            'bg-white/95 backdrop-blur-lg dark:bg-neutral-800',
            '[transition:_all_300ms_ease-out,_z-index_300ms_step-end]',
            'data-[open]:[transition:_all_300ms_ease-out,_z-index_300ms_step-start]',
            'z-[-1] -translate-y-4 opacity-0',
            'data-[open]:z-10 data-[open]:translate-y-0 data-[open]:opacity-100'
          )}
        >
          {Tools.map((tool) => (
            <div
              key={tool.name}
              className="flex p-4 pr-16 transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-neutral-700/20"
            >
              <div className="w-full">
                <div className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-200">
                  {tool.name}
                </div>
                {tool.items.map((item) => (
                  <CloseButton
                    as={Link}
                    key={item.name}
                    className={clsx(
                      'mt-2 flex items-center',
                      'transition-all duration-300',
                      'text-gray-600 hover:text-sky-500 dark:text-gray-50 dark:hover:text-sky-500'
                    )}
                    href={item.href}
                  >
                    <div className="mr-3 h-8 w-8 rounded p-1.5">
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
