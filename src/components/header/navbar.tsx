'use client';

import type { BlogCategory } from '@/types/blog';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { cn } from '@/utils/cn';
import useWindowDevice from '@/hooks/window/use-window-device';
import HeaderDesktop from './desktop';
import HeaderMobile from './mobile';
import Link from 'next/link';

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
      className={cn(
        'fixed top-0 z-50 w-full border-b transition-all duration-300',
        headerExpanded
          ? 'border-transparent bg-transparent py-4'
          : 'supports-backdrop-blur:bg-white/60 border-transparent bg-white/60 backdrop-blur lg:border-neutral-400/20 dark:bg-neutral-900/60'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between',
          'mx-auto max-w-screen-2xl p-4 lg:px-8'
        )}
      >
        <Link className="flex items-center" href="/">
          <Image
            src="/assets/images/header/logo.png"
            width="30"
            height="30"
            alt="Logo"
          />
          <div className="ml-3 hidden text-lg font-bold lg:block dark:text-neutral-100">
            Yizzy Peasy
          </div>
        </Link>

        {isDesktop ? (
          <HeaderDesktop />
        ) : (
          <HeaderMobile categoryArticles={categoryArticles} />
        )}
      </div>
    </header>
  );
}
