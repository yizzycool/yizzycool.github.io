'use client';

import { BlogCategory } from '@/types/blog';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown, Newspaper } from 'lucide-react';
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
        <DisclosureButton
          className={clsx(
            'group flex w-full items-center justify-between rounded-lg px-3 py-4',
            'transition-all duration-300',
            'data-[hover]:bg-neutral-200 dark:data-[hover]:bg-neutral-800/50'
          )}
        >
          <div className="flex items-center gap-3">
            <Newspaper size={20} />
            <span className="font-medium">Blog</span>
          </div>
          <ChevronDown className="size-5 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          transition
          className={clsx(
            'ml-3 mt-2 overflow-hidden border-l border-neutral-400/50',
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
