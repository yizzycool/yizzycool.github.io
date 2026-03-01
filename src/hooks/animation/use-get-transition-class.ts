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

  const slideBaseClass = 'animate-duration-1000 opacity-0';

  const getFadeUpClass = (delay = 'animate-delay-0') =>
    clsx(slideBaseClass, delay, mounted && loaded && 'animate-fade-up');

  return {
    getFadeUpClass,
  };
}
