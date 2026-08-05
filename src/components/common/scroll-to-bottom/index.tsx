'use client';

import { useState, useEffect, RefObject } from 'react';
import { ArrowDown } from 'lucide-react';

import { cn } from '@/utils/cn';

type ScrollToBottomProps = {
  /**
   * Distance from bottom in pixels before the button appears.
   * @default 200
   */
  threshold?: number;
  /**
   * Whether to scroll smoothly or instantly.
   * @default true
   */
  smooth?: boolean;
  /**
   * Target container element ref. If not provided, scrolls window.
   */
  targetRef?: RefObject<HTMLElement | null>;
  /**
   * Extra CSS classes for container.
   */
  className?: string;
  /**
   * Extra CSS classes for the icon.
   */
  iconClassName?: string;
  /**
   * Callback when scroll to bottom button is clicked.
   */
  onClick?: () => void;
};

export default function ScrollToBottom({
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
        'group fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out',
        'border-neutral-200/80 bg-white/70 text-slate-800 shadow-neutral-200/40 hover:bg-white dark:border-neutral-400/80 dark:bg-neutral-950/70 dark:text-slate-200 dark:shadow-black/50 dark:hover:bg-neutral-900',
        'hover:translate-y-1 active:scale-95',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
        className
      )}
      aria-label="Scroll to bottom"
    >
      <ArrowDown
        className={cn(
          'h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5',
          iconClassName
        )}
      />
    </button>
  );
}
