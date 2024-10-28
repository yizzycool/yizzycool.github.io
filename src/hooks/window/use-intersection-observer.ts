'use client';

import { useEffect, useState } from 'react';
import _get from 'lodash/get';

export default function useIntersectionObserver({
  rootSelector,
  rootMargin = '0px',
  threshold = 1.0,
  targetSelector,
}: {
  rootSelector: string;
  rootMargin?: string;
  threshold?: number;
  targetSelector: string;
}) {
  const [hit, setHit] = useState(false);

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

  const callback = (entries: Array<any>, observer: IntersectionObserver) => {
    const intersectionRatio = _get(entries, '0.intersectionRatio', 0);
    if (intersectionRatio < threshold) {
      setHit(false);
    } else {
      setHit(true);
    }
  };

  return {
    hit,
  };
}
