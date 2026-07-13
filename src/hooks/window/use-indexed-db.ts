import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook for simple IndexedDB key-value operations.
 */
export function useIndexedDB(dbName: string, storeName: string, version = 1) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'indexedDB' in window);
  }, []);

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
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [dbName, storeName, version]);

  const getValue = useCallback(
    <T>(key: string): Promise<T | null> => {
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
    [openDB, storeName]
  );

  const setValue = useCallback(
    <T>(key: string, value: T): Promise<void> => {
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
    [openDB, storeName]
  );

  const deleteValue = useCallback(
    (key: string): Promise<void> => {
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
    [openDB, storeName]
  );

  return {
    isSupported,
    getValue,
    setValue,
    deleteValue,
  };
}
