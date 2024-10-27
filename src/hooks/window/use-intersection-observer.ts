'use client';

import { useEffect } from 'react';

export default function useIntersectionObserver({
  rootSelector,
  rootMargin = '0px',
  threshold = 1.0,
  targetSelector,
  callback,
}: {
  rootSelector: string;
  rootMargin?: string;
  threshold?: number;
  targetSelector: string;
  callback: IntersectionObserverCallback;
}) {
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const options: {
      root: Element | null;
      rootMargin: string;
      threshold: number;
    } = {
      root: document.querySelector(rootSelector),
      rootMargin,
      threshold,
    };
    const observer = new IntersectionObserver(callback, options);
    const target = <Element>document.querySelector(targetSelector);
    observer.observe(target);
  };
}
