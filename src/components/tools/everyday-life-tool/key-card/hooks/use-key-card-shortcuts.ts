import type { CardData } from '../types';

import { useState, useEffect } from 'react';

export function useKeyCardShortcuts({
  cards,
  mode,
  saveCards,
  triggerSnackbar,
}: {
  cards: CardData[];
  mode: 'dashboard' | 'management';
  saveCards: (newCards: CardData[]) => void;
  triggerSnackbar: (msg: string, variant?: 'success' | 'error') => void;
}) {
  const [focusCardId, setFocusCardId] = useState<string | null>(null);
  const [focusTab, setFocusTab] = useState<number>(0);
  const [listeningCardId, setListeningCardId] = useState<string | null>(null);

  // Keyboard shortcut listener for Dashboard Mode
  useEffect(() => {
    if (
      mode !== 'dashboard' ||
      focusCardId !== null ||
      listeningCardId !== null
    )
      return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore key combinations with modification keys (e.g. Cmd+R, Ctrl+C)
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;

      // Ignore when user is actively typing in inputs
      const active = document.activeElement;
      if (active) {
        const tagName = active.tagName.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          active.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
      }

      const pressedKey = e.key.toLowerCase();
      const matchedCard = cards.find((c) => c.key === pressedKey);
      if (matchedCard) {
        e.preventDefault();
        setFocusCardId(matchedCard.id);
        setFocusTab(0);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [mode, cards, focusCardId, listeningCardId]);

  // Key-binding keydown capturing in Management Mode
  useEffect(() => {
    if (!listeningCardId) return;

    const handleBindKeyDown = (e: KeyboardEvent) => {
      // Ignore navigation modifiers
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      e.preventDefault();
      e.stopPropagation();

      const pressedKey = e.key.toLowerCase();

      // Cancel with ESC key
      if (e.key === 'Escape') {
        setListeningCardId(null);
        return;
      }

      // Check if it's alphanumeric
      if (/^[a-z0-9]$/.test(pressedKey)) {
        // Search for duplicate keys
        const collisionCard = cards.find(
          (c) => c.key === pressedKey && c.id !== listeningCardId
        );

        if (collisionCard) {
          triggerSnackbar(
            `Hotkey [${pressedKey.toUpperCase()}] is already bound to "${collisionCard.title}". Please choose another key.`,
            'error'
          );
        } else {
          const updated = cards.map((c) =>
            c.id === listeningCardId ? { ...c, key: pressedKey } : c
          );
          saveCards(updated);
          setListeningCardId(null);
          triggerSnackbar(
            `Successfully bound hotkey [${pressedKey.toUpperCase()}]!`,
            'success'
          );
        }
      } else {
        triggerSnackbar(
          'Hotkeys must be a single letter (A-Z) or number (0-9).',
          'error'
        );
      }
    };

    window.addEventListener('keydown', handleBindKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleBindKeyDown, true);
    };
  }, [listeningCardId, cards, saveCards, triggerSnackbar]);

  return {
    focusCardId,
    setFocusCardId,
    focusTab,
    setFocusTab,
    listeningCardId,
    setListeningCardId,
  };
}
