import type { CardData } from '../types';

import { useState, useEffect, useCallback, type RefObject } from 'react';

import toast from '@/utils/toast';

type UseKeyCardShortcutsParams = {
  cards: CardData[];
  filteredCards: CardData[];
  mode: 'dashboard' | 'management';
  setMode: (mode: 'dashboard' | 'management') => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
  saveCards: (newCards: CardData[]) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export function useKeyCardShortcuts({
  cards,
  filteredCards,
  mode,
  setMode,
  isCompact,
  setIsCompact,
  saveCards,
  searchInputRef,
  searchQuery,
  setSearchQuery,
}: UseKeyCardShortcutsParams) {
  const [focusCardId, setFocusCardId] = useState<string | null>(null);
  const [focusTab, setFocusTab] = useState<number>(0);
  const [listeningCardId, setListeningCardId] = useState<string | null>(null);
  const [isShortcutsGuideOpen, setIsShortcutsGuideOpen] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(-1);

  // Navigate to Next / Prev card in FocusModal
  const navigateFocusCard = useCallback(
    (direction: 'prev' | 'next') => {
      if (!focusCardId || filteredCards.length === 0) return;
      const currentIndex = filteredCards.findIndex((c) => c.id === focusCardId);
      if (currentIndex === -1) return;

      const newIndex =
        direction === 'next'
          ? (currentIndex + 1) % filteredCards.length
          : (currentIndex - 1 + filteredCards.length) % filteredCards.length;

      setFocusCardId(filteredCards[newIndex].id);
      setFocusTab(0);
    },
    [focusCardId, filteredCards]
  );

  // Copy current tab content in FocusModal
  const copyCurrentFocusContent = useCallback(() => {
    const currentCard = cards.find((c) => c.id === focusCardId);
    if (!currentCard || !currentCard.contents) return;

    const contentText = currentCard.contents[focusTab]?.text || '';
    if (!contentText) {
      toast.error('No content to copy in this version.');
      return;
    }

    navigator.clipboard
      .writeText(contentText)
      .then(() => {
        toast.success(
          `Copied "${currentCard.title}" (${currentCard.contents[focusTab]?.label || `Tab ${focusTab + 1}`}) to clipboard!`
        );
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard.');
      });
  }, [cards, focusCardId, focusTab]);

  // Global & Dashboard Shortcut Listener
  useEffect(() => {
    if (listeningCardId !== null) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.getAttribute('contenteditable') === 'true');

      // 1. Search focus (/ or Cmd+K / Ctrl+K)
      if (
        (e.key === '/' && !isTyping) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        if (mode === 'dashboard') {
          e.preventDefault();
          searchInputRef?.current?.focus();
          return;
        }
      }

      // 2. Open Shortcuts Guide (?)
      if (e.key === '?' && !isTyping && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutsGuideOpen((prev) => !prev);
        return;
      }

      // 3. Escape handling
      if (e.key === 'Escape') {
        if (isShortcutsGuideOpen) {
          setIsShortcutsGuideOpen(false);
          return;
        }
        if (focusCardId) {
          setFocusCardId(null);
          return;
        }
        if (isTyping && active instanceof HTMLElement) {
          active.blur();
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          return;
        }
      }

      // 4. Focus Modal specific shortcuts
      if (focusCardId !== null) {
        if (isTyping) return;

        // Copy on 'c' (only if no text is actively highlighted/selected)
        if (
          (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c')
        ) {
          const selection = window.getSelection()?.toString();
          if (!selection) {
            e.preventDefault();
            copyCurrentFocusContent();
            return;
          }
        }

        // Navigate prev/next card
        if (e.key === '[' || e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateFocusCard('prev');
          return;
        }
        if (e.key === ']' || e.key === 'ArrowRight') {
          e.preventDefault();
          navigateFocusCard('next');
          return;
        }

        return;
      }

      // If user is typing in form inputs, do not trigger single-key actions below
      if (isTyping) return;

      // 5. Dashboard View specific shortcuts
      if (mode === 'dashboard') {
        // Toggle compact mode with 'c'
        if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsCompact(!isCompact);
          return;
        }

        // Toggle mode with 'm'
        if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setMode('management');
          return;
        }

        // Keyboard arrow navigation on cards grid
        if (
          ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)
        ) {
          if (filteredCards.length === 0) return;
          e.preventDefault();
          setFocusedCardIndex((prev) => {
            if (prev === -1) return 0;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
              return (prev + 1) % filteredCards.length;
            } else {
              return (prev - 1 + filteredCards.length) % filteredCards.length;
            }
          });
          return;
        }

        // Enter to open selected card from keyboard navigation
        if (
          e.key === 'Enter' &&
          focusedCardIndex >= 0 &&
          focusedCardIndex < filteredCards.length
        ) {
          e.preventDefault();
          setFocusCardId(filteredCards[focusedCardIndex].id);
          setFocusTab(0);
          return;
        }

        // Direct Hotkey (A-Z / 0-9) to open card
        if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
          const pressedKey = e.key.toLowerCase();
          const matchedCard = cards.find((c) => c.key === pressedKey);
          if (matchedCard) {
            e.preventDefault();
            setFocusCardId(matchedCard.id);
            setFocusTab(0);
            return;
          }
        }
      } else if (mode === 'management') {
        // Toggle mode with 'm'
        if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setMode('dashboard');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [
    listeningCardId,
    mode,
    setMode,
    isCompact,
    setIsCompact,
    searchQuery,
    setSearchQuery,
    focusCardId,
    cards,
    filteredCards,
    focusedCardIndex,
    isShortcutsGuideOpen,
    searchInputRef,
    navigateFocusCard,
    copyCurrentFocusContent,
  ]);

  // Key-binding listener for Management Mode
  useEffect(() => {
    // Skip attaching keydown listener if no card is currently in hotkey recording mode
    if (!listeningCardId) return;

    const handleBindKeyDown = (e: KeyboardEvent) => {
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
          toast.error(
            `Hotkey [${pressedKey.toUpperCase()}] is already bound to "${collisionCard.title}". Please choose another key.`
          );
        } else {
          const updated = cards.map((c) =>
            c.id === listeningCardId ? { ...c, key: pressedKey } : c
          );
          saveCards(updated);
          setListeningCardId(null);
          toast.success(
            `Successfully bound hotkey [${pressedKey.toUpperCase()}]!`
          );
        }
      } else {
        toast.error('Hotkeys must be a single letter (A-Z) or number (0-9).');
      }
    };

    window.addEventListener('keydown', handleBindKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleBindKeyDown, true);
    };
  }, [listeningCardId, cards, saveCards]);

  return {
    focusCardId,
    setFocusCardId,
    focusTab,
    setFocusTab,
    listeningCardId,
    setListeningCardId,
    isShortcutsGuideOpen,
    setIsShortcutsGuideOpen,
    focusedCardIndex,
    setFocusedCardIndex,
    navigateFocusCard,
    copyCurrentFocusContent,
  };
}
