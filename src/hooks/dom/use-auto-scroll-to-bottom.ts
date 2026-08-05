'use client';

import { useEffect, useRef, useCallback, RefObject } from 'react';

type UseAutoScrollToBottomOptions = {
  /**
   * Ref of the target container element to scroll into view.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /**
   * Whether streaming / processing is currently active.
   */
  isStreaming?: boolean;
  /**
   * Distance from bottom in pixels to consider "at bottom".
   * @default 100
   */
  threshold?: number;
};

export default function useAutoScrollToBottom<T = unknown>(
  dep: T,
  options: UseAutoScrollToBottomOptions = {}
) {
  const { containerRef, isStreaming = false, threshold = 100 } = options;

  const isAutoScrollEnabledRef = useRef<boolean>(false);
  const lastScrollYRef = useRef<number>(0);

  const getDistanceFromBottom = useCallback(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return rect.bottom - viewportHeight;
    } else {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const clientHeight = window.innerHeight;
      return scrollHeight - (scrollY + clientHeight);
    }
  }, [containerRef]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (containerRef?.current) {
        containerRef.current.scrollIntoView({
          block: 'end',
          inline: 'nearest',
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
      isAutoScrollEnabledRef.current = true;
    },
    [containerRef]
  );

  const startAutoScroll = useCallback(() => {
    isAutoScrollEnabledRef.current = true;
    scrollToBottom(true);
  }, [scrollToBottom]);

  const stopAutoScroll = useCallback(() => {
    isAutoScrollEnabledRef.current = false;
  }, []);

  // Automatically start auto-scroll when streaming begins
  useEffect(() => {
    if (isStreaming) {
      isAutoScrollEnabledRef.current = true;
      scrollToBottom(true);
    }
  }, [isStreaming, scrollToBottom]);

  // Listen for user manual scroll-up events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        isAutoScrollEnabledRef.current = false;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      if (currentY - touchStartY > 10) {
        isAutoScrollEnabledRef.current = false;
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset;

      if (currentScrollY < lastScrollYRef.current - 5) {
        isAutoScrollEnabledRef.current = false;
      }

      // Re-enable auto scroll if user scrolls back near bottom
      const distanceFromBottom = getDistanceFromBottom();
      if (distanceFromBottom <= threshold) {
        isAutoScrollEnabledRef.current = true;
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [getDistanceFromBottom, threshold]);

  // Auto scroll when dependency (results) updates DURING STREAMING
  useEffect(() => {
    if (isStreaming && isAutoScrollEnabledRef.current) {
      scrollToBottom(false);
    }
  }, [dep, isStreaming, scrollToBottom]);

  return {
    scrollToBottom,
    startAutoScroll,
    stopAutoScroll,
    isAutoScrollEnabled: isAutoScrollEnabledRef.current,
  };
}
