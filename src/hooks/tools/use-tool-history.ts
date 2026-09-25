'use client';

import { useState, useEffect, useCallback } from 'react';
import isEqual from 'lodash/isEqual';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';

export interface HistoryItem<T = unknown> {
  id: string;
  timestamp: number;
  title?: string;
  preview: string;
  previewImage?: string;
  data: T;
}

const MAX_HISTORY_ITEMS = 10;

export function useToolHistory<T = unknown>(
  toolKey: string,
  maxItems: number = MAX_HISTORY_ITEMS
) {
  const [historyList, setHistoryList] = useState<HistoryItem<T>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getValue, setValue, clearStore, isSupported } = useToolsDB();
  const {
    isHistoryEnabled: checkHistoryEnabled,
    toggleHistoryEnabled: togglePrefHistoryEnabled,
  } = useToolsPreferences();

  const isHistoryEnabled = toolKey ? checkHistoryEnabled(toolKey) : true;

  const toggleHistoryEnabled = useCallback(
    (forceEnabled?: boolean) => {
      if (toolKey) {
        togglePrefHistoryEnabled(toolKey, forceEnabled);
      }
    },
    [toolKey, togglePrefHistoryEnabled]
  );

  // Load from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    if (!toolKey) {
      return;
    }

    getValue<HistoryItem<T>[]>('history', toolKey)
      .then((items) => {
        if (isMounted) {
          if (Array.isArray(items)) {
            setHistoryList(items);
          } else {
            setHistoryList([]);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHistoryList([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getValue, toolKey]);

  // Save or update history entry
  const saveHistory = useCallback(
    async (
      preview: string,
      data: T,
      previewImage?: string,
      title?: string,
      existingId?: string
    ): Promise<string | undefined> => {
      if (!toolKey || !isHistoryEnabled) return undefined;

      const trimmedPreview =
        preview.trim().slice(0, 100) || 'No preview available';
      const id =
        existingId ||
        `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newItem: HistoryItem<T> = {
        id,
        timestamp: Date.now(),
        title: title?.trim() || undefined,
        preview: trimmedPreview,
        previewImage,
        data,
      };

      setHistoryList((prev = []) => {
        const filtered = prev.filter((item) => {
          if (existingId) {
            return item.id !== existingId;
          }
          return (
            item.preview !== trimmedPreview ||
            item.previewImage !== previewImage ||
            !isEqual(item.data, data)
          );
        });
        const updated = [newItem, ...filtered].slice(0, maxItems);

        // Async write to IndexedDB
        setValue('history', toolKey, updated).catch((_err) => {
          // Silent catch
        });

        return updated;
      });

      return id;
    },
    [isHistoryEnabled, maxItems, setValue, toolKey]
  );

  // Add history entry
  const addHistory = useCallback(
    async (preview: string, data: T, previewImage?: string, title?: string) => {
      await saveHistory(preview, data, previewImage, title);
    },
    [saveHistory]
  );

  // Rename history entry
  const renameHistory = useCallback(
    async (id: string, newTitle: string) => {
      if (!toolKey) return;

      setHistoryList((prev = []) => {
        const updated = prev.map((item) =>
          item.id === id
            ? { ...item, title: newTitle.trim() || undefined }
            : item
        );
        setValue('history', toolKey, updated).catch(() => {});
        return updated;
      });
    },
    [setValue, toolKey]
  );

  // Remove single entry
  const removeHistory = useCallback(
    async (id: string) => {
      if (!toolKey) return;

      setHistoryList((prev = []) => {
        const updated = prev.filter((item) => item.id !== id);
        setValue('history', toolKey, updated).catch(() => {});
        return updated;
      });
    },
    [setValue, toolKey]
  );

  // Clear all entries for current tool
  const clearHistory = useCallback(async () => {
    if (!toolKey) return;
    setHistoryList([]);
    await setValue('history', toolKey, []).catch(() => {});
  }, [setValue, toolKey]);

  // Clear all entries across all tools in the history store
  const clearAllToolsHistory = useCallback(async () => {
    setHistoryList([]);
    await clearStore('history').catch(() => {});
  }, [clearStore]);

  return {
    historyList,
    historyCount: historyList.length,
    isLoading: toolKey ? isLoading : false,
    isHistoryEnabled,
    toggleHistoryEnabled,
    addHistory,
    saveHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    clearAllToolsHistory,
    isSupported,
  };
}
