import { useSyncExternalStore } from 'react';

// Empty subscribe callback since the client status does not change after mounting
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Hook to determine if the component is mounted on the client side.
 * Uses `useSyncExternalStore` to avoid hydration mismatch and avoid extra re-renders.
 *
 * @returns {boolean} `true` if running on client, `false` during server-side rendering.
 */
export default function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
