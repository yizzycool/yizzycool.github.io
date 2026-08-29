'use client';

import { useCallback, useEffect } from 'react';
import xor from 'lodash/xor';

import { useLocalStorage } from '@/hooks/window/use-local-storage';

const STORAGE_KEY_FAVORITES = 'yizzypeasy-fav-tools';
const LEGACY_STORAGE_KEY_FAVORITES = 'yizzy-peasy-fav-tools';

export default function useToolsPreferences() {
  const {
    value: favoriteToolKeys,
    setValue: setFavoriteToolKeys,
    isSupported,
  } = useLocalStorage<string[]>(STORAGE_KEY_FAVORITES, []);

  // Migrate legacy favorite key if exists and new key is empty
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY_FAVORITES);
      if (legacy && (!favoriteToolKeys || favoriteToolKeys.length === 0)) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFavoriteToolKeys(parsed);
        }
        localStorage.removeItem(LEGACY_STORAGE_KEY_FAVORITES);
      }
    } catch (_e) {}
  }, [favoriteToolKeys, setFavoriteToolKeys]);

  const toggleFavorite = useCallback(
    (toolKey: string) => {
      setFavoriteToolKeys(xor(favoriteToolKeys, [toolKey]));
    },
    [favoriteToolKeys, setFavoriteToolKeys]
  );

  const isFavorite = useCallback(
    (toolKey: string) => favoriteToolKeys.includes(toolKey),
    [favoriteToolKeys]
  );

  return {
    favoriteToolKeys,
    toggleFavorite,
    isFavorite,
    isSupported,
  };
}
