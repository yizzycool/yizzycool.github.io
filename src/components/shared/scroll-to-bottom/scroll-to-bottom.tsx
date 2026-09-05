'use client';

import type { ScrollToBottomProps } from './types';

import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import {
  getScrollToBottomVisibilityStyles,
  scrollToBottomBaseStyles,
  scrollToBottomIconBaseStyles,
} from './scroll-to-bottom.variants';

export function ScrollToBottom({
  threshold = 200,
  smooth = true,
  targetRef,
  className,
  iconClassName,
  onClick,
}: ScrollToBottomProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getDistanceFromBottom = () => {
      if (targetRef?.current) {
        const el = targetRef.current;
        return el.scrollHeight - el.scrollTop - el.clientHeight;
      } else {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        const clientHeight = window.innerHeight;
        return scrollHeight - (scrollY + clientHeight);
      }
    };

    const handleScroll = () => {
      const distanceFromBottom = getDistanceFromBottom();
      setIsVisible(distanceFromBottom > threshold);
    };

    const target = targetRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, targetRef]);

  const scrollToBottom = () => {
    if (targetRef?.current) {
      targetRef.current.scrollTo({
        top: targetRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
    onClick?.();
  };

  return (
    <button
      onClick={scrollToBottom}
      className={cn(
        scrollToBottomBaseStyles,
        getScrollToBottomVisibilityStyles(isVisible),
        className
      )}
      aria-label="Scroll to bottom"
    >
      <ArrowDown className={cn(scrollToBottomIconBaseStyles, iconClassName)} />
    </button>
  );
}
