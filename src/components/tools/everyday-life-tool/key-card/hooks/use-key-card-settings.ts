'use client';

import type { KeyCardSettings, SortOrderOption } from '../types';

import { useState, useEffect, useCallback } from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';

import { DEFAULT_SETTINGS } from '../constants';

const STORE_NAME = 'settings';
const SETTINGS_KEY = 'key-card';

export function useKeyCardSettings() {
  const [settings, setSettings] = useState<KeyCardSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const { getValue, setValue } = useToolsDB();

  // Load settings on mount
  useEffect(() => {
    let isMounted = true;

    getValue<Partial<KeyCardSettings>>(STORE_NAME, SETTINGS_KEY)
      .then((savedSettings) => {
        if (isMounted && savedSettings && typeof savedSettings === 'object') {
          setSettings((prev) => ({
            ...prev,
            ...savedSettings,
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load KeyCard settings from IndexedDB:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsSettingsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getValue]);

  // Persist updated settings to IndexedDB
  const updateSettings = useCallback(
    (
      newSettingsOrUpdater:
        | Partial<KeyCardSettings>
        | ((prev: KeyCardSettings) => KeyCardSettings)
    ) => {
      setSettings((prev) => {
        const next =
          typeof newSettingsOrUpdater === 'function'
            ? newSettingsOrUpdater(prev)
            : { ...prev, ...newSettingsOrUpdater };

        setValue(STORE_NAME, SETTINGS_KEY, next).catch((err) => {
          console.error('Failed to save KeyCard settings to IndexedDB:', err);
        });

        return next;
      });
    },
    [setValue]
  );

  const setMode = useCallback(
    (mode: 'dashboard' | 'management') => {
      updateSettings({ mode });
    },
    [updateSettings]
  );

  const setIsCompact = useCallback(
    (isCompact: boolean) => {
      updateSettings({ isCompact });
    },
    [updateSettings]
  );

  const setSortOrder = useCallback(
    (sortOrder: SortOrderOption) => {
      updateSettings({ sortOrder });
    },
    [updateSettings]
  );

  const setSelectedTag = useCallback(
    (selectedTag: string | null) => {
      updateSettings({ selectedTag });
    },
    [updateSettings]
  );

  const toggleCardCollapse = useCallback(
    (cardId: string) => {
      updateSettings((prev) => {
        const isCollapsed = prev.collapsedCards.includes(cardId);
        const collapsedCards = isCollapsed
          ? prev.collapsedCards.filter((id) => id !== cardId)
          : [...prev.collapsedCards, cardId];
        return { ...prev, collapsedCards };
      });
    },
    [updateSettings]
  );

  const setAllCardsCollapsed = useCallback(
    (collapsed: boolean, cardIds: string[]) => {
      updateSettings({
        collapsedCards: collapsed ? [...cardIds] : [],
      });
    },
    [updateSettings]
  );

  return {
    settings,
    isSettingsLoaded,
    updateSettings,
    setMode,
    setIsCompact,
    setSortOrder,
    setSelectedTag,
    toggleCardCollapse,
    setAllCardsCollapsed,
  };
}
