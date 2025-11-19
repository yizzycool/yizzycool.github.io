'use client';

import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  return (
    <>
      <Disclosure as="div" className="">
        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-4 data-[hover]:bg-neutral-800/10">
          <span className="font-medium">Tools</span>
          <ChevronDown className="size-5 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          transition
          className={clsx(
            'ml-3 mt-2 overflow-hidden border-l-[1px] border-neutral-400/20',
            'origin-top transition duration-200 ease-out data-[closed]:-translate-y-10 data-[closed]:opacity-0'
          )}
        >
          {Tools.map((tool) => (
            <div key={tool.name} className="flex p-4 pr-16">
              <div className="w-full">
                <div className="mb-4 font-bold text-gray-700 dark:text-gray-200">
                  {tool.name}
                </div>
                {tool.items.map((item) => (
                  <Link
                    key={item.name}
                    className={clsx(
                      'mt-2 flex items-center text-sm text-gray-600',
                      'hover:text-sky-500 hover:underline dark:hover:text-sky-500',
                      'data-[active=true]:text-sky-500',
                      'data-[active=false]:text-gray-600 dark:data-[active=false]:text-gray-50'
                    )}
                    href={item.href}
                    onClick={closeSidePanel}
                    data-active={pathname === item.href}
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
