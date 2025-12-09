import clsx from 'clsx';
import { useEffect, useState } from 'react';

type Props = {
  loaded?: boolean;
};

export default function useGetTransitionClass({ loaded = true }: Props = {}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slideBaseClass = 'transition-all duration-1000 ease-out transform';

  const getSlideUpClass = (delay = 'delay-0') =>
    clsx(
      slideBaseClass,
      mounted && loaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-12',
      delay
    );

  const getSlideDownClass = (delay = 'delay-0') =>
    clsx(
      slideBaseClass,
      mounted && loaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-12',
      delay
    );

  const getSlideLeftClass = (delay = 'delay-0') =>
    clsx(
      slideBaseClass,
      mounted && loaded
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 translate-x-12',
      delay
    );

  const getSlideRightClass = (delay = 'delay-0') =>
    clsx(
      slideBaseClass,
      mounted && loaded
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 -translate-x-12',
      delay
    );

  return {
    getSlideUpClass,
    getSlideDownClass,
    getSlideLeftClass,
    getSlideRightClass,
  };
}
