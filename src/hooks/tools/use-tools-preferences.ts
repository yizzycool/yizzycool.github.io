'use client';

import { useCallback } from 'react';
import xor from 'lodash/xor';
import { useLocalStorage } from '@/hooks/window/use-local-storage';

const STORAGE_KEY_FAVORITES = 'yizzy-peasy-fav-tools';

export default function useToolsPreferences() {
  const {
    value: favoriteToolKeys,
    setValue: setFavoriteToolKeys,
    isSupported,
  } = useLocalStorage<string[]>(STORAGE_KEY_FAVORITES, []);

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
