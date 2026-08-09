import { cn } from '@/utils/cn';
import { useSyncExternalStore } from 'react';

type Props = {
  loaded?: boolean;
};

export default function useGetTransitionClass({ loaded = true }: Props = {}) {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const slideBaseClass = 'animate-duration-1000';

  const getFadeUpClass = (delay = 'animate-delay-0') =>
    cn(
      slideBaseClass,
      delay,
      mounted && loaded ? 'animate-fade-up' : 'opacity-0'
    );

  const getFadeInClass = (delay = 'animate-delay-0') => {
    cn(
      slideBaseClass,
      delay,
      mounted && loaded ? 'animate-in fade-in' : 'opacity-0'
    );
  };

  return {
    getFadeUpClass,
    getFadeInClass,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}
