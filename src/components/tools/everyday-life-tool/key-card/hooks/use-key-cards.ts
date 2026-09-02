import type { CardData, ContentVersion } from '../types';

import { useState, useEffect, useCallback } from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import { useIndexedDB } from '@/hooks/window/use-indexed-db';
import toast from '@/utils/toast';

import { DEFAULT_CARDS } from '../constants';

const OBJECT_STORE_NAME = 'snippets';
const KEY_NAME = 'key-card';
const LEGACY_KEY_NAME = 'keycard';
const LEGACY_DB_NAME = 'yizzypeasy-key-card';

const LEGACY_DB_OPTIONS = { version: 1 };

export function useKeyCards() {
  const [cards, setCards] = useState<CardData[]>(DEFAULT_CARDS);
  const [isLoaded, setIsLoaded] = useState(false);

  const { getValue, setValue, deleteValue } = useToolsDB();

  const { getValue: getLegacyValue, deleteDB: deleteLegacyDB } = useIndexedDB(
    LEGACY_DB_NAME,
    LEGACY_DB_OPTIONS
  );

  // Helper to purge legacy DB and legacy localStorage keys
  const cleanupLegacyStorage = useCallback(() => {
    try {
      localStorage.removeItem(LEGACY_KEY_NAME);
    } catch (_e) {}

    deleteLegacyDB().catch(() => {});
  }, [deleteLegacyDB]);

  // Load from IndexedDB on mount with multi-source migration and automatic legacy cleanup
  useEffect(() => {
    const load = async () => {
      try {
        const savedCards = await getValue<CardData[]>(
          OBJECT_STORE_NAME,
          KEY_NAME
        );
        if (savedCards !== null) {
          // Record exists in new Unified IndexedDB OBJECT_STORE_NAME store!
          setCards(savedCards);
        } else {
          // Check legacy IndexedDB (LEGACY_DB_NAME)
          const legacyDBCards = await getLegacyValue<CardData[]>(
            'settings',
            LEGACY_KEY_NAME
          );

          if (legacyDBCards !== null && Array.isArray(legacyDBCards)) {
            setCards(legacyDBCards);
            setValue(OBJECT_STORE_NAME, KEY_NAME, legacyDBCards).catch(
              () => {}
            );
          }
        }
        cleanupLegacyStorage();
        setIsLoaded(true);
      } catch (_err) {
        setCards(DEFAULT_CARDS);
        setIsLoaded(true);
      }
    };

    load();
  }, [cleanupLegacyStorage, deleteValue, getLegacyValue, getValue, setValue]);

  // Save logic with IndexedDB OBJECT_STORE_NAME store
  const saveCards = (newCards: CardData[]) => {
    setCards(newCards);

    // Write to unified IndexedDB OBJECT_STORE_NAME store
    setValue(OBJECT_STORE_NAME, KEY_NAME, newCards);
  };

  // Move Card Up or Down in order
  const moveCard = (id: string, direction: 'up' | 'down') => {
    const index = cards.findIndex((c) => c.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const updated = [...cards];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    saveCards(updated);
  };

  // Add Card
  const addCard = () => {
    const now = Date.now();
    const newId = `card_${now}`;
    const newCard: CardData = {
      id: newId,
      key: '', // Unassigned initially
      title: 'Untitled Card',
      tags: '',
      contents: [{ label: 'Version 1', text: '' }],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...cards, newCard];
    saveCards(updated);
    toast.success('Added a new cheat sheet card.');
    return newId;
  };

  // Duplicate Card
  const duplicateCard = (id: string) => {
    const cardToDuplicate = cards.find((c) => c.id === id);
    if (!cardToDuplicate) return '';

    const now = Date.now();
    const newId = `card_${now}`;
    const duplicatedCard: CardData = {
      ...cardToDuplicate,
      id: newId,
      title: `${cardToDuplicate.title} (Copy)`,
      key: '', // Clear shortcut key binding on duplicate to avoid conflicts
      contents: cardToDuplicate.contents.map((content) => ({ ...content })),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...cards, duplicatedCard];
    saveCards(updated);
    toast.success(`Duplicated "${cardToDuplicate.title}" card.`);
    return newId;
  };

  // Delete Card
  const deleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    saveCards(updated);
    toast.success('Deleted the cheat sheet card.');
  };

  // Delete All Cards
  const deleteAllCards = () => {
    saveCards([]);
    toast.success('Deleted all cheat sheets successfully.');
  };

  // Reset to Default Cards
  const resetToInitial = () => {
    saveCards(DEFAULT_CARDS);
    toast.success('Reset all cheat sheets to default templates.');
  };

  // Update Main Card Field (title, tags, key)
  const updateCardField = (
    id: string,
    field: keyof CardData,
    value: string
  ) => {
    const now = Date.now();
    const updated = cards.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: value, updatedAt: now } as CardData;
      }
      return c;
    });
    saveCards(updated);
  };

  // Update individual content version field
  const updateCardContent = (
    id: string,
    index: number,
    field: keyof ContentVersion,
    value: string
  ) => {
    const now = Date.now();
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newContents = [...c.contents];
        newContents[index] = { ...newContents[index], [field]: value };
        return { ...c, contents: newContents, updatedAt: now };
      }
      return c;
    });
    saveCards(updated);
  };

  // Add content version dynamically
  const addCardContent = (id: string) => {
    const now = Date.now();
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newIndex = c.contents.length + 1;
        const newContents = [
          ...c.contents,
          {
            label: `Version ${newIndex}`,
            text: '',
          },
        ];
        return { ...c, contents: newContents, updatedAt: now };
      }
      return c;
    });
    saveCards(updated);
  };

  // Duplicate content version dynamically
  const duplicateCardContent = (id: string, index: number) => {
    const now = Date.now();
    const updated = cards.map((c) => {
      if (c.id === id && c.contents[index]) {
        const target = c.contents[index];
        const duplicated = {
          label: `${target.label} (Copy)`,
          text: target.text,
        };
        const newContents = [
          ...c.contents.slice(0, index + 1),
          duplicated,
          ...c.contents.slice(index + 1),
        ];
        return { ...c, contents: newContents, updatedAt: now };
      }
      return c;
    });
    saveCards(updated);
    toast.success('Duplicated content version.');
  };

  // Delete content version dynamically
  const deleteCardContent = (id: string, index: number) => {
    const now = Date.now();
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newContents = c.contents.filter((_, idx) => idx !== index);
        return { ...c, contents: newContents, updatedAt: now };
      }
      return c;
    });
    saveCards(updated);
  };

  // Export JSON
  const exportCards = () => {
    if (cards.length === 0) {
      toast.error('No cheat sheet data to export!');
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(cards, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `keycard_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Backup JSON file downloaded successfully!');
  };

  // Import JSON with replace or merge mode
  const importCards = (
    file: File,
    importMode: 'replace' | 'merge' = 'replace'
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedData = JSON.parse(text);

        if (!Array.isArray(importedData)) {
          throw new Error('JSON content must be an array of cards!');
        }

        const migratedData = importedData as CardData[];

        const isValid = migratedData.every(
          (item) =>
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            typeof item.tags === 'string' &&
            Array.isArray(item.contents) &&
            item.contents.every(
              (c: ContentVersion) =>
                typeof c.label === 'string' && typeof c.text === 'string'
            )
        );

        if (!isValid) {
          throw new Error('The imported JSON structure is invalid.');
        }

        if (importMode === 'replace') {
          // Validate key collisions in imported file
          const keys = migratedData.map((item) => item.key).filter((k) => !!k);
          const uniqueKeys = new Set(keys);
          if (keys.length !== uniqueKeys.size) {
            throw new Error(
              'The imported file contains duplicate shortcut key bindings.'
            );
          }

          saveCards(migratedData);
          toast.success(
            `Successfully imported ${migratedData.length} cards (Replaced).`
          );
        } else {
          // Merge mode: append and clear duplicate hotkeys on incoming cards
          const existingKeys = new Set(cards.map((c) => c.key).filter(Boolean));
          let clearedHotkeysCount = 0;

          const newCards = migratedData.map((item, idx) => {
            let key = item.key;
            if (key && existingKeys.has(key)) {
              key = '';
              clearedHotkeysCount++;
            } else if (key) {
              existingKeys.add(key);
            }

            return {
              ...item,
              id: `imported_${Date.now()}_${idx}`,
              key,
            };
          });

          const merged = [...cards, ...newCards];
          saveCards(merged);

          if (clearedHotkeysCount > 0) {
            toast.success(
              `Merged ${newCards.length} cards. ${clearedHotkeysCount} duplicate hotkeys were unassigned to prevent conflicts.`
            );
          } else {
            toast.success(
              `Successfully merged ${newCards.length} cards into library!`
            );
          }
        }
      } catch (error) {
        toast.error(`Import failed: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  return {
    cards,
    isLoaded,
    addCard,
    duplicateCard,
    deleteCard,
    deleteAllCards,
    resetToInitial,
    updateCardField,
    updateCardContent,
    addCardContent,
    duplicateCardContent,
    deleteCardContent,
    exportCards,
    importCards,
    saveCards,
    moveCard,
  };
}
