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
      <Disclosure as="div" className="group">
        <DisclosureButton
          className={clsx(
            'flex w-full items-center justify-between rounded-lg px-3 py-4',
            'transition-all duration-300',
            'data-[hover]:bg-neutral-200 dark:data-[hover]:bg-neutral-800/50'
          )}
        >
          <div className="flex items-center gap-3">
            <Newspaper size={20} />
            <span className="font-medium">Blog</span>
          </div>
          <ChevronDown className="size-5 transition-all duration-300 group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel
          static
          className={clsx(
            'grid grid-rows-[0fr] transition-all duration-300 ease-out',
            'data-[open]:grid-rows-[1fr]'
          )}
        >
          <div className="ml-4 overflow-hidden border-l border-neutral-400/50 pl-2">
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
