'use client';

import { BlogCategory } from '@/types/blog';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import LeftPanel from '@/components/blog/layout/left-panel';

export default function BlogSelectorMobile({
  closeSidePanel,
  categoryArticles,
}: {
  closeSidePanel: () => void;
  categoryArticles: BlogCategory;
}) {
  return (
    <>
      <Disclosure as="div" className="">
        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-4 data-[hover]:bg-neutral-800/10">
          <span className="font-medium">Blog</span>
          <ChevronDown className="size-5 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          transition
          className={clsx(
            'mt-2 overflow-hidden',
            'origin-top transition duration-200 ease-out data-[closed]:-translate-y-10 data-[closed]:opacity-0'
          )}
        >
          <div className="ml-2 pb-4">
            <LeftPanel
              categoryArticles={categoryArticles}
              side="headerBlogSelector"
              onClick={closeSidePanel}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
