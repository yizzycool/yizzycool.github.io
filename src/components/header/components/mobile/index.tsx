'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeSelector from '../theme-selector';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
import { ToolsSelectorMobile } from '../tools-selector';

export default function HeaderMobile() {
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
      <button className="h-9 w-9 p-1" onClick={() => setOpen(true)}>
        <Bars3Icon className="w-full" />
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
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
                <div className="flex h-full flex-col overflow-y-scroll bg-gray-100 py-6 shadow-xl dark:bg-gray-700">
                  <div className="flex items-center justify-between px-4 sm:px-6">
                    <Image
                      src="/assets/images/header/logo.png"
                      width="20"
                      height="20"
                      alt="Logo"
                    />
                    <button
                      className="h-9 w-9 p-1"
                      onClick={() => setOpen(false)}
                    >
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                  <div className="relative mt-6 flex-1 px-2 sm:px-4">
                    {/* Tools */}
                    <ToolsSelectorMobile
                      closeSidePanel={() => setOpen(false)}
                    />
                    {/* <ToolsSelectorMobile /> */}
                    {/* Divider */}
                    <div className="my-2 mt-5 border-t border-gray-400/50 dark:border-gray-600" />
                    {/* Theme Selector */}
                    <ThemeSelector />
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
