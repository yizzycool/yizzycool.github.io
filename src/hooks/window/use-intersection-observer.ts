'use client';

import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

export default function useIntersectionObserver({
  rootSelector = null,
  rootMargin = '0px',
  threshold = 1.0,
  once = true,
  targetSelector,
}: {
  rootSelector?: string | null;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  targetSelector: string;
}) {
  const [hit, setHit] = useState(false);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const callback = (
    entries: IntersectionObserverEntry[],
    _observer: IntersectionObserver
  ) => {
    const intersectionRatio = _get(entries, '0.intersectionRatio', 0);
    if (intersectionRatio < threshold) {
      if (!once) {
        setHit(false);
      }
    } else {
      setHit(true);
    }
  };

  return {
    hit,
  };
}
