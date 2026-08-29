'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const LOCAL_STORAGE_EVENT = 'yizzypeasy-local-storage-update';

/**
 * Custom React hook for simple localStorage key-value operations.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    checkIsSupported,
    getBoolServerSnapshot
  );

  const getSnapshot = useCallback(() => {
    if (!checkIsSupported()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }, [key]);

  const rawValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getNullServerSnapshot
  );

  const value = useMemo<T>(() => {
    if (rawValue === null) {
      return initialValue;
    }
    try {
      return JSON.parse(rawValue) as T;
    } catch (_error) {
      return initialValue;
    }
  }, [rawValue, initialValue]);

  const setValue = useCallback(
    (val: T) => {
      try {
        if (!checkIsSupported()) return;
        window.localStorage.setItem(key, JSON.stringify(val));
        window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));
      } catch (_error) {
        // Ignore write errors
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      if (!checkIsSupported()) return;
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));
    } catch (_error) {
      // Ignore removal errors
    }
  }, [key]);

  return {
    value,
    setValue,
    removeValue,
    isSupported,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(LOCAL_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(LOCAL_STORAGE_EVENT, callback);
  };
}

function emptySubscribe() {
  return () => {};
}

function checkIsSupported(): boolean {
  return typeof window !== 'undefined' && 'localStorage' in window;
}

function getBoolServerSnapshot(): boolean {
  return false;
}

function getNullServerSnapshot(): null {
  return null;
}
