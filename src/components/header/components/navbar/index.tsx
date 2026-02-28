'use client';

import type { BlogCategory } from '@/types/blog';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import useWindowDevice from '@/hooks/window/use-window-device';
import HeaderDesktop from '../desktop';
import HeaderMobile from '../mobile';

type Props = {
  categoryArticles: BlogCategory;
};

export default function Navbar({ categoryArticles }: Props) {
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const isToolPage = pathname.startsWith('/tools');

  const { isDesktop } = useWindowDevice();

  // Handle Scroll & Mount Animations
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    // Check once page loaded
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerExpanded = !scrolled && !isToolPage;

  return (
    <header
      className={clsx(
        'fixed top-0 z-50 w-full border-b transition-all duration-300',
        headerExpanded
          ? 'border-transparent bg-transparent py-4'
          : 'supports-backdrop-blur:bg-white/60 border-transparent bg-white/60 backdrop-blur lg:border-neutral-400/20 dark:bg-neutral-900/60'
      )}
    >
      {isDesktop ? (
        <div className="mx-auto hidden max-w-screen-2xl p-4 lg:block lg:px-8">
          <HeaderDesktop />
        </div>
      ) : (
        <div className="mx-auto max-w-screen-2xl p-4 lg:hidden lg:px-8">
          <HeaderMobile categoryArticles={categoryArticles} />
        </div>
      )}
    </header>
  );
}
