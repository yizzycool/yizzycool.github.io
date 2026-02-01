'use client';

import { useEffect, useMemo, useState } from 'react';
import _isUndefined from 'lodash/isUndefined';

const BreakPoints = {
  'width-sm': 640,
  'width-md': 768,
  'width-lg': 1024,
  'width-xl': 1280,
  'width-2xl': 1536,
};

export default function useWindowDevice() {
  const [width, setWidth] = useState<number>();

  const isDesktop = useMemo(() => {
    if (_isUndefined(width)) return false;
    return width >= BreakPoints['width-lg'];
  }, [width]);

  const isPad = useMemo(() => {
    if (_isUndefined(width)) return false;
    return width < BreakPoints['width-lg'] && width >= BreakPoints['width-sm'];
  }, [width]);

  const isMobile = useMemo(() => {
    if (_isUndefined(width)) return false;
    return width < BreakPoints['width-sm'];
  }, [width]);

  useEffect(() => {
    onResized();
    window.addEventListener('resize', onResized);
    return () => {
      window.removeEventListener('resize', onResized);
    };
  }, []);

  const onResized = () => {
    setWidth(window.innerWidth);
  };

  return {
    isDesktop,
    isPad,
    isMobile,
  };
}
