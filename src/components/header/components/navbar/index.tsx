'use client';

import { BlogCategory } from '@/types/blog';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import HeaderDesktop from '../desktop';
import HeaderMobile from '../mobile';
import useWindowDevice from '@/hooks/window/use-window-device';

type Props = {
  categoryArticles: BlogCategory;
};

export default function Navbar({ categoryArticles }: Props) {
  const [scrolled, setScrolled] = useState(false);

  const { isDesktop } = useWindowDevice();

  // Handle Scroll & Mount Animations
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={clsx(
        'fixed top-0 z-50 w-full border-b transition-all duration-300',
        !scrolled && 'border-transparent bg-transparent py-4',
        scrolled &&
          'supports-backdrop-blur:bg-white/60 border-transparent bg-white/95 backdrop-blur lg:border-neutral-400/20 dark:bg-neutral-900/60'
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
    </div>
  );
}
