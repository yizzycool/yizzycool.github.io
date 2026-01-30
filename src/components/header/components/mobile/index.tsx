'use client';

import type { BlogCategory } from '@/types/blog';

import clsx from 'clsx';
import { Home, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import ThemeSelector from '../theme-selector';
import { ToolsSelectorMobile } from '../tools-selector';
import BlogSelectorMobile from './components/blog-selector';
import SearchDialog from '@/components/common/search-dialog';
import GeneralLink from './components/general-link';
import SocialIcons from '@/components/common/social-icons';
import Drawer from '@/components/common/drawer';

export default function HeaderMobile({
  categoryArticles,
}: {
  categoryArticles: BlogCategory;
}) {
  const [open, setOpen] = useState(false);

  const closeSidePanel = () => setOpen(false);

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
      <div className="items-centexr flex flex-1 justify-end gap-4 px-4">
        {/* Search Dialog */}
        <SearchDialog deviceType="mobile" />
        {/* Theme Selector */}
        <ThemeSelector />
      </div>

      <button className="h-9 w-9 p-1" onClick={() => setOpen(true)}>
        <Menu className="w-full" />
      </button>
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        className="w-screen !max-w-md"
      >
        <div
          className={clsx(
            'flex h-full flex-col overflow-hidden py-6 shadow-2xl',
            'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95'
          )}
        >
          <div className="flex items-center justify-between px-4 sm:px-6">
            <div />
            <button
              className="group rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={closeSidePanel}
            >
              <X
                aria-hidden="true"
                size={24}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>

          {/* Drawer Contents */}
          <div className="relative mt-6 flex flex-1 flex-col gap-2 overflow-y-auto px-4">
            {/* Home */}
            <GeneralLink
              onClick={closeSidePanel}
              icon={Home}
              label="Home"
              href="/"
            />

            {/* Tools */}
            <ToolsSelectorMobile closeSidePanel={closeSidePanel} />

            {/* Blog */}
            <BlogSelectorMobile
              closeSidePanel={closeSidePanel}
              categoryArticles={categoryArticles}
            />

            {/* Resume */}
            <GeneralLink
              onClick={closeSidePanel}
              icon={UserRound}
              label="Resume"
              href="/resume"
            />
          </div>

          {/* Drawer Footer */}
          <div className="mt-6 border-t border-neutral-200 px-4 pt-6 dark:border-neutral-700">
            <SocialIcons
              types={['github', 'linkedin', 'email']}
              className="justify-center"
            />
            <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
              © 2025 Yizzy Peasy.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
