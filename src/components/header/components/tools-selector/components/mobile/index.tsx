'use client';

import { usePathname } from 'next/navigation';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown, PenTool } from 'lucide-react';
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
      <Disclosure as="div" className="group">
        <DisclosureButton
          className={clsx(
            'flex w-full items-center justify-between rounded-lg px-3 py-4',
            'data-[hover]:bg-neutral-200 dark:data-[hover]:bg-neutral-800/50'
          )}
        >
          <div className="flex items-center gap-3">
            <PenTool size={20} />
            <span className="font-medium">Tools</span>
          </div>
          <ChevronDown className="size-5 transition-all duration-300 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          transition
          className={clsx(
            'ml-3 mt-2 border-l border-neutral-400/50',
            'grid grid-rows-[1fr] transition-all duration-300 ease-out',
            'data-[closed]:grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
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
                        'mt-2 flex items-center text-sm',
                        'transition-all duration-300',
                        'hover:text-sky-500 dark:hover:text-sky-500',
                        'data-[active=true]:text-sky-500'
                      )}
                      href={item.href}
                      onClick={closeSidePanel}
                      data-active={pathname === item.href}
                    >
                      <div className="mr-3 h-8 w-8 p-1.5 dark:border-gray-500/50">
                        <item.icon.component className="h-full w-full" />
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
