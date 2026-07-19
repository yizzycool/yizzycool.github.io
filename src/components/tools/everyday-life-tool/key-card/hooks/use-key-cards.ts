import type { CardData, ContentVersion } from '../types';

import { useState, useEffect } from 'react';

import { useIndexedDB } from '@/hooks/window/use-indexed-db';
import { DEFAULT_CARDS } from '../constants';

const DB_NAME = 'yizzypeasy-key-card';
const STORE_NAME = 'settings';
const KEY_NAME = 'keycard';
const DB_VERSION = 1;

export function useKeyCards(
  triggerSnackbar: (msg: string, variant?: 'success' | 'error') => void
) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getValue, setValue } = useIndexedDB(DB_NAME, STORE_NAME, DB_VERSION);

  // Load from IndexedDB on mount with localStorage fallback
  useEffect(() => {
    getValue<CardData[]>(KEY_NAME)
      .then((savedCards) => {
        if (savedCards !== null) {
          // Record exists in IndexedDB (even if it's empty []). Use it!
          setCards(savedCards);
        } else {
          // No record in IndexedDB, fallback check on localStorage
          let localSaved: string | null = null;
          try {
            localSaved = localStorage.getItem(KEY_NAME);
          } catch (_e) {}

          if (localSaved !== null) {
            // Record exists in localStorage (even if it's empty []). Use it!
            const parsed = JSON.parse(localSaved) as CardData[];
            setCards(parsed);
            setValue(KEY_NAME, parsed).catch(() => {});
          } else {
            // First time loading ever. Load defaults!
            setCards(DEFAULT_CARDS);
            setValue(KEY_NAME, DEFAULT_CARDS).catch(() => {});
            try {
              localStorage.setItem(KEY_NAME, JSON.stringify(DEFAULT_CARDS));
            } catch (_e) {}
          }
        }
        setIsLoaded(true);
      })
      .catch((_err) => {
        // Full localstorage fallback if IndexedDB is blocked
        try {
          const saved = localStorage.getItem(KEY_NAME);
          if (saved !== null) {
            setCards(JSON.parse(saved) as CardData[]);
          } else {
            setCards(DEFAULT_CARDS);
            localStorage.setItem(KEY_NAME, JSON.stringify(DEFAULT_CARDS));
          }
        } catch (_e) {
          setCards(DEFAULT_CARDS);
        }
        setIsLoaded(true);
      });
  }, [getValue, setValue]);

  // Save logic with IndexedDB & localStorage dual update
  const saveCards = (newCards: CardData[]) => {
    setCards(newCards);

    // Background async write to IndexedDB
    setValue(KEY_NAME, newCards).catch((_err) => {
      // Fallback write to localStorage on failure
      try {
        localStorage.setItem(KEY_NAME, JSON.stringify(newCards));
      } catch (_e) {}
    });
  };

  // Add Card
  const addCard = () => {
    const newId = `card_${Date.now()}`;
    const newCard: CardData = {
      id: newId,
      key: '', // Unassigned initially
      title: 'Untitled Card',
      tags: '',
      contents: [{ label: '', text: '' }],
    };
    const updated = [...cards, newCard];
    saveCards(updated);
    triggerSnackbar('Added a new cheat sheet card.', 'success');
    return newId;
  };

  // Duplicate Card
  const duplicateCard = (id: string) => {
    const cardToDuplicate = cards.find((c) => c.id === id);
    if (!cardToDuplicate) return '';

    const newId = `card_${Date.now()}`;
    const duplicatedCard: CardData = {
      ...cardToDuplicate,
      id: newId,
      key: '', // Clear shortcut key binding on duplicate to avoid conflicts
      // Deep copy contents to prevent reference sharing
      contents: cardToDuplicate.contents.map((content) => ({ ...content })),
    };
    const updated = [...cards, duplicatedCard];
    saveCards(updated);
    triggerSnackbar(`Duplicated "${cardToDuplicate.title}" card.`, 'success');
    return newId;
  };

  // Delete Card
  const deleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    saveCards(updated);
    triggerSnackbar('Deleted the cheat sheet card.', 'success');
  };

  // Delete All Cards
  const deleteAllCards = () => {
    saveCards([]);
    triggerSnackbar('Deleted all cheat sheets successfully.', 'success');
  };

  // Reset to Default Cards
  const resetToInitial = () => {
    saveCards(DEFAULT_CARDS);
    triggerSnackbar('Reset all cheat sheets to default templates.', 'success');
  };

  // Update Main Card Field (title, tags, key)
  const updateCardField = (
    id: string,
    field: keyof CardData,
    value: string
  ) => {
    const updated = cards.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: value } as CardData;
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
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newContents = [...c.contents];
        newContents[index] = { ...newContents[index], [field]: value };
        return { ...c, contents: newContents };
      }
      return c;
    });
    saveCards(updated);
  };

  // Add content version dynamically
  const addCardContent = (id: string) => {
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newContents = [
          ...c.contents,
          {
            label: '',
            text: '',
          },
        ];
        return { ...c, contents: newContents };
      }
      return c;
    });
    saveCards(updated);
  };

  // Delete content version dynamically
  const deleteCardContent = (id: string, index: number) => {
    const updated = cards.map((c) => {
      if (c.id === id) {
        const newContents = c.contents.filter((_, idx) => idx !== index);
        return { ...c, contents: newContents };
      }
      return c;
    });
    saveCards(updated);
  };

  // Export JSON
  const exportCards = () => {
    if (cards.length === 0) {
      triggerSnackbar('No cheat sheet data to export!', 'error');
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(cards, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'keycard_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSnackbar('Backup JSON file downloaded successfully!', 'success');
  };

  // Import JSON
  const importCards = (file: File) => {
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

        // Validate key collisions in imported file
        const keys = migratedData.map((item) => item.key).filter((k) => !!k);
        const uniqueKeys = new Set(keys);
        if (keys.length !== uniqueKeys.size) {
          throw new Error(
            'The imported file contains duplicate shortcut key bindings.'
          );
        }

        saveCards(migratedData);
        triggerSnackbar('Cheat sheets imported successfully!', 'success');
      } catch (error) {
        triggerSnackbar(`Import failed: ${(error as Error).message}`, 'error');
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
    deleteCardContent,
    exportCards,
    importCards,
    saveCards,
  };
}
