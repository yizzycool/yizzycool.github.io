'use client';

import { useState, useEffect, useCallback } from 'react';
import isEqual from 'lodash/isEqual';

import { useToolsDB } from '@/hooks/tools/use-tools-db';

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

  const { getValue, setValue, isSupported } = useToolsDB();

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

  // Add history entry
  const addHistory = useCallback(
    async (preview: string, data: T, previewImage?: string, title?: string) => {
      if (!toolKey) return;

      const trimmedPreview =
        preview.trim().slice(0, 100) || 'No preview available';
      const newItem: HistoryItem<T> = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        title: title?.trim() || undefined,
        preview: trimmedPreview,
        previewImage,
        data,
      };

      setHistoryList((prev = []) => {
        // Prevent duplicate items with fast short-circuit check followed by deep data comparison
        const filtered = prev.filter(
          (item) =>
            item.preview !== trimmedPreview ||
            item.previewImage !== previewImage ||
            !isEqual(item.data, data)
        );
        const updated = [newItem, ...filtered].slice(0, maxItems);

        // Async write to IndexedDB
        setValue('history', toolKey, updated).catch((_err) => {
          // Silent catch
        });

        return updated;
      });
    },
    [maxItems, setValue, toolKey]
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

  // Clear all entries
  const clearHistory = useCallback(async () => {
    if (!toolKey) return;
    setHistoryList([]);
    await setValue('history', toolKey, []).catch(() => {});
  }, [setValue, toolKey]);

  return {
    historyList,
    historyCount: historyList.length,
    isLoading: toolKey ? isLoading : false,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    isSupported,
  };
}
