'use client';

import { BlogCategory } from '@/types/blog';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
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
          <div className="ml-3 border-l-[1px] border-neutral-400/20 p-4 pr-16">
            <Link
              className="mb-4 block font-bold text-gray-700 dark:text-gray-200"
              href="/blog"
              onClick={closeSidePanel}
            >
              View all articles
            </Link>
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
