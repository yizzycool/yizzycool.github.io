'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface UseIndexedDBOptions {
  version?: number;
  /** List of object store names to ensure are created upon initialization / upgrade */
  stores?: string[];
  /** Custom onupgradeneeded callback for custom store creations or migrations */
  onUpgrade?: (
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number | null
  ) => void;
}

/**
 * Custom React hook for generic IndexedDB key-value operations across stores.
 */
export function useIndexedDB<StoreName extends string = string>(
  dbName: string,
  options: UseIndexedDBOptions = {}
) {
  const isSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { version = 1, stores = [], onUpgrade } = options;

  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(
          new Error(
            'IndexedDB is not supported or not in a browser environment'
          )
        );
        return;
      }
      const request = indexedDB.open(dbName, version);
      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Ensure default/provided stores exist
        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        });

        if (onUpgrade) {
          onUpgrade(db, event.oldVersion, event.newVersion);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [dbName, version, stores, onUpgrade]);

  const getValue = useCallback(
    <T>(storeName: StoreName, key: string): Promise<T | null> => {
      return openDB().then((db) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);
          request.onsuccess = () => resolve((request.result as T) || null);
          request.onerror = () => reject(request.error);
        });
      });
    },
    [openDB]
  );

  const setValue = useCallback(
    <T>(storeName: StoreName, key: string, value: T): Promise<void> => {
      return openDB().then((db) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(value, key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    },
    [openDB]
  );

  const deleteValue = useCallback(
    (storeName: StoreName, key: string): Promise<void> => {
      return openDB().then((db) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    },
    [openDB]
  );

  const deleteDB = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(
          new Error(
            'IndexedDB is not supported or not in a browser environment'
          )
        );
        return;
      }
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  }, [dbName]);

  return {
    isSupported,
    getValue,
    setValue,
    deleteValue,
    deleteDB,
  };
}

function subscribe(_callback: () => void) {
  return () => {};
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function getServerSnapshot(): boolean {
  return false;
}
