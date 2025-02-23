'use client';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Tools } from '../..';
import clsx from 'clsx';

export default function ToolsSelectorMobile({
  closeSidePanel,
}: {
  closeSidePanel: () => void;
}) {
  return (
    <>
      <Disclosure as="div" className="">
        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-2 data-[hover]:bg-neutral-800/10">
          <span className="text-sm/6 font-medium">Tools</span>
          <ChevronDown className="size-5 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          transition
          className={clsx(
            'mt-2 overflow-hidden',
            'origin-top transition duration-200 ease-out data-[closed]:-translate-y-10 data-[closed]:opacity-0'
          )}
        >
          {Tools.map((tool) => (
            <div key={tool.name} className="flex p-4 pr-16">
              <div className="w-full">
                <div className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-200">
                  {tool.name}
                </div>
                {tool.items.map((item) => (
                  <Link
                    key={item.name}
                    className="mt-2 flex items-center text-gray-600 hover:text-sky-500 hover:underline dark:text-gray-50 dark:hover:text-sky-500"
                    href={item.href}
                    onClick={closeSidePanel}
                  >
                    <div className="mr-3 h-8 w-8 rounded border border-gray-300 p-1.5 dark:border-gray-500/50">
                      <item.icon.component className="h-full w-full" />
                    </div>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
