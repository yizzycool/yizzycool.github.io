'use client';

import type { ScrollToTopProps } from './types';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import {
  getScrollToTopVisibilityStyles,
  scrollToTopBaseStyles,
  scrollToTopIconBaseStyles,
} from './scroll-to-top.variants';

export function ScrollToTop({
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
        scrollToTopBaseStyles,
        getScrollToTopVisibilityStyles(isVisible),
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className={cn(scrollToTopIconBaseStyles, iconClassName)} />
    </button>
  );
}
