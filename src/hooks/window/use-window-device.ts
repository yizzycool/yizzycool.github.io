import variables from '@/styles/variables.module.scss';
import { useEffect, useMemo, useState } from 'react';
import _isNull from 'lodash/isNull';

export default function useWindowDevice() {
  const [width, setWidth] = useState<number | null>(null);

  const isDesktop = useMemo(() => {
    return !_isNull(width) && width > parseInt(variables['widthLG']);
  }, [width]);

  const isPad = useMemo(() => {
    return (
      !_isNull(width) &&
      width <= parseInt(variables['widthLG']) &&
      width > parseInt(variables['widthSM'])
    );
  }, [width]);

  const isMobile = useMemo(() => {
    return !_isNull(width) && width <= parseInt(variables['widthSM']);
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
