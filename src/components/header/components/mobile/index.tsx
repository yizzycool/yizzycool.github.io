'use client';

import { BlogCategory } from '@/types/blog';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeSelector from '../theme-selector';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { ToolsSelectorMobile } from '../tools-selector';
import BlogSelectorMobile from './components/blog-selector';
import SearchDialog from '@/components/common/search-dialog';

export default function HeaderMobile({
  categoryArticles,
}: {
  categoryArticles: BlogCategory;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <Link href="/">
        <Image
          src="/assets/images/header/logo.png"
          width="36"
          height="36"
          alt="Logo"
        />
      </Link>
      <div className="items-centexr flex flex-1 justify-end gap-2 px-4">
        {/* Search Dialog */}
        <SearchDialog deviceType="mobile" />
        {/* Theme Selector */}
        <ThemeSelector />
      </div>

      <button className="h-9 w-9 p-1" onClick={() => setOpen(true)}>
        <Menu className="w-full" />
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-neutral-900/75 transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-neutral-50 py-6 shadow-xl dark:bg-neutral-800">
                  <div className="flex items-center justify-between px-4 sm:px-6">
                    <div />
                    <button className="p-1" onClick={() => setOpen(false)}>
                      <X aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                  <div className="relative mt-6 flex-1 px-2 sm:px-4">
                    {/* Tools */}
                    <ToolsSelectorMobile
                      closeSidePanel={() => setOpen(false)}
                    />
                    {/* Blog */}
                    <BlogSelectorMobile
                      closeSidePanel={() => setOpen(false)}
                      categoryArticles={categoryArticles}
                    />
                    {/* Resume */}
                    <Link
                      className="block px-3 py-4 font-medium"
                      href="/resume"
                      onClick={() => setOpen(false)}
                    >
                      Resume
                    </Link>
                    {/* Home */}
                    <Link
                      className="block px-3 py-4 font-medium"
                      href="/"
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </Link>
                    {/* Divider */}
                    <div className="my-5 border-t border-neutral-400/50 dark:border-neutral-600" />
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
