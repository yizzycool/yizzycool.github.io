'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/utils/cn';

type ScrollToTopProps = {
  /**
   * Scroll distance in pixels before the button appears.
   * @default 1000
   */
  threshold?: number;
  /**
   * Whether to scroll smoothly or instantly.
   * @default true
   */
  smooth?: boolean;
  /**
   * Extra CSS classes for container.
   */
  className?: string;
  /**
   * Extra CSS classes for the icon.
   */
  iconClassName?: string;
};

export default function ScrollToTop({
  threshold = 1000,
  smooth = true,
  className,
  iconClassName,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position in case page is already scrolled on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'group fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out',
        'border-neutral-200/80 bg-white/70 text-slate-800 shadow-neutral-200/40 hover:bg-white dark:border-neutral-400/80 dark:bg-neutral-950/70 dark:text-slate-200 dark:shadow-black/50 dark:hover:bg-neutral-900',
        'hover:-translate-y-1 active:scale-95',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp
        className={cn(
          'h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5',
          iconClassName
        )}
      />
    </button>
  );
}
