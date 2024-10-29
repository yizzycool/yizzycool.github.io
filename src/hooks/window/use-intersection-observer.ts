'use client';

import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

export default function useIntersectionObserver({
  rootSelector = null,
  rootMargin = '0px',
  threshold = 1.0,
  targetSelector,
}: {
  rootSelector?: string | null;
  rootMargin?: string;
  threshold?: number;
  targetSelector: string;
}) {
  const [hit, setHit] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    // If `IntersectionObserver` not support, setHit to be true forever
    if (!window?.IntersectionObserver) {
      setHit(true);
    } else {
      const options: IntersectionObserverInit = {
        root: _isNull(rootSelector)
          ? rootSelector
          : document.querySelector(rootSelector),
        rootMargin,
        threshold,
      };
      const observer = new IntersectionObserver(callback, options);
      const target = <Element>document.querySelector(targetSelector);
      observer.observe(target);
    }
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
