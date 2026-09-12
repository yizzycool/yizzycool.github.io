'use client';

import { useCallback } from 'react';
import xor from 'lodash/xor';

import { useLocalStorage } from '@/hooks/window/use-local-storage';
import { TOOLS_WITH_HISTORY } from '@/components/tools/common/header-block/constants';

const STORAGE_KEY_FAVORITES = 'yizzypeasy-fav-tools';
const STORAGE_KEY_DISABLED_HISTORY = 'yizzypeasy-disabled-history-tools';

export default function useToolsPreferences() {
  const {
    value: favoriteToolKeys,
    setValue: setFavoriteToolKeys,
    isSupported,
  } = useLocalStorage<string[]>(STORAGE_KEY_FAVORITES, []);

  const {
    value: disabledHistoryToolKeys,
    setValue: setDisabledHistoryToolKeys,
  } = useLocalStorage<string[]>(STORAGE_KEY_DISABLED_HISTORY, []);

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

  const clearAllFavorites = useCallback(() => {
    setFavoriteToolKeys([]);
  }, [setFavoriteToolKeys]);

  // Derived state: True if all history-supporting tools are disabled
  const isGlobalHistoryPaused =
    TOOLS_WITH_HISTORY.length > 0 &&
    TOOLS_WITH_HISTORY.every((key) => disabledHistoryToolKeys.includes(key));

  const isHistoryEnabled = useCallback(
    (toolKey: string) => !disabledHistoryToolKeys.includes(toolKey),
    [disabledHistoryToolKeys]
  );

  const toggleHistoryEnabled = useCallback(
    (toolKey: string, forceEnabled?: boolean) => {
      if (forceEnabled === true) {
        setDisabledHistoryToolKeys(
          disabledHistoryToolKeys.filter((k) => k !== toolKey)
        );
      } else if (forceEnabled === false) {
        if (!disabledHistoryToolKeys.includes(toolKey)) {
          setDisabledHistoryToolKeys([...disabledHistoryToolKeys, toolKey]);
        }
      } else {
        setDisabledHistoryToolKeys(xor(disabledHistoryToolKeys, [toolKey]));
      }
    },
    [disabledHistoryToolKeys, setDisabledHistoryToolKeys]
  );

  // Global batch toggle: pauses all tools or resumes all tools
  const setIsGlobalHistoryPaused = useCallback(
    (paused: boolean) => {
      if (paused) {
        setDisabledHistoryToolKeys([...TOOLS_WITH_HISTORY]);
      } else {
        setDisabledHistoryToolKeys([]);
      }
    },
    [setDisabledHistoryToolKeys]
  );

  return {
    favoriteToolKeys,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    disabledHistoryToolKeys,
    isGlobalHistoryPaused,
    setIsGlobalHistoryPaused,
    isHistoryEnabled,
    toggleHistoryEnabled,
    isSupported,
  };
}
