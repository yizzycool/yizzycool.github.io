'use client';

import { useState, useEffect } from 'react';

/**
 * Custom Hook to check if component is mounted.
 *
 * @deprecated Deprecated since React 18. This pattern is not recommended; use `useIsClient` instead.
 * @returns {boolean} `true` if the component has mounted on the client side, otherwise `false`.
 */
export default function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
