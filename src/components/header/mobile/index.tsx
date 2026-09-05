'use client';

import type { BlogCategory } from '@/types/blog';

import { cn } from '@/utils/cn';
import { Home, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';

import useWindowDevice from '@/hooks/window/use-window-device';
import ThemeSelector from '../theme-selector';
import { ToolsSelectorMobile } from '../tools-selector';
import BlogSelectorMobile from './blog-selector';
import { SearchDialog } from '@/components/shared/search-dialog';
import GeneralLink from './general-link';
import { SocialIcons } from '@/components/shared/social-icons';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { BuyMeACoffee } from '@/components/shared/buy-me-a-coffee';

type HeaderMobileProps = {
  categoryArticles: BlogCategory;
};

export default function HeaderMobile({ categoryArticles }: HeaderMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { isReady, isNotDesktop } = useWindowDevice();

  const closeDrawer = () => setIsOpen(false);

  /**
   * Controls drawer visibility: requires client window check to be ready (isReady),
   * current device size to be non-desktop (isNotDesktop), and open state to be true (isOpen).
   * Automatically collapses the drawer when resized to desktop mode.
   */
  const isDrawerOpen = isReady && isNotDesktop && isOpen;

  return (
    <>
      <div className="flex flex-1 items-center justify-end gap-4 px-4">
        {/* Search Dialog */}
        <SearchDialog deviceType="mobile" />
        {/* Theme Selector */}
        <ThemeSelector />
      </div>

      <button
        className="h-9 w-9 p-1"
        onClick={() => setIsOpen(true)}
        aria-label="menu"
      >
        <Menu className="w-full" />
      </button>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsOpen(false)}
        className="w-screen !max-w-md"
      >
        <div
          className={cn(
            'flex h-full flex-col overflow-hidden py-6 shadow-2xl',
            'bg-white/90 backdrop-blur-md dark:bg-neutral-900/95'
          )}
        >
          <div className="flex items-center justify-between px-4 sm:px-6">
            <div />
            <Button
              variant="ghost"
              size="base"
              rounded="full"
              icon={X}
              iconClassName="transition-transform duration-300 group-hover:rotate-90"
              onClick={closeDrawer}
              ariaLabel="Close menu"
            />
          </div>

          {/* Drawer Contents */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="relative mt-6 flex flex-col gap-2 px-4">
              {/* Home */}
              <li>
                <GeneralLink
                  onClick={closeDrawer}
                  icon={Home}
                  label="Home"
                  href="/"
                />
              </li>

              {/* Tools */}
              <ToolsSelectorMobile closeDrawer={closeDrawer} />

              {/* Blog */}
              <BlogSelectorMobile
                closeDrawer={closeDrawer}
                categoryArticles={categoryArticles}
              />

              {/* Resume */}
              <li>
                <GeneralLink
                  onClick={closeDrawer}
                  icon={UserRound}
                  label="Resume"
                  href="/resume"
                />
              </li>
            </ul>
          </nav>

          {/* Buy Me a Coffee */}
          <BuyMeACoffee
            linkClassName={cn('lg:hidden ml-auto w-44 px-4 max-w-full')}
          />

          {/* Drawer Footer */}
          <footer className="mt-6 border-t border-neutral-200 px-4 pt-6 dark:border-neutral-700">
            <SocialIcons
              types={['github', 'linkedin', 'email']}
              className="justify-center"
            />
            <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
              © 2026 Yizzy Peasy.
            </p>
          </footer>
        </div>
      </Drawer>
    </>
  );
}
